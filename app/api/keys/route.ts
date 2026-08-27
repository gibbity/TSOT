import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

// POST: Generate a new API key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tier = (body.tier === 'pro' || body.tier === 'enterprise') ? body.tier : 'free';
    // Allow custom testing limit if specified, else default based on tier
    const dailyLimit = typeof body.dailyLimit === 'number' ? body.dailyLimit : (tier === 'pro' ? 500 : (tier === 'enterprise' ? 5000 : 5));

    const rawKey = `tsot_live_${crypto.randomBytes(16).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = `${rawKey.slice(0, 14)}...`;

    if (supabase) {
      const { data, error } = await supabase.from('api_keys').insert({
        key_hash: keyHash,
        key_prefix: keyPrefix,
        tier: tier,
        daily_limit: dailyLimit,
        is_active: true
      }).select().single();

      if (error) {
        console.error('Failed to create api key in database:', error);
        return NextResponse.json({ error: 'Failed to create API key in database' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      apiKey: rawKey,
      keyPrefix: keyPrefix,
      tier: tier,
      dailyLimit: dailyLimit,
      message: 'Store your API key securely. It will not be shown again in plaintext.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// GET: Check usage status of an existing key OR list all keys if ?list=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isList = searchParams.get('list') === 'true';

    if (isList) {
      if (!supabase) {
        return NextResponse.json({
          keys: [
            {
              id: 'demo-key-1',
              key_prefix: 'tsot_live_9f8a...',
              tier: 'free',
              daily_limit: 50,
              is_active: true,
              created_at: new Date().toISOString(),
              count: 12
            }
          ]
        });
      }

      const { data: keys, error } = await supabase
        .from('api_keys')
        .select('id, key_prefix, tier, daily_limit, is_active, created_at, key_hash')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const today = new Date().toISOString().split('T')[0];
      const keysWithUsage = await Promise.all((keys || []).map(async (k) => {
        const { data: usage } = await supabase
          .from('api_usage')
          .select('request_count')
          .eq('key_hash', k.key_hash)
          .eq('usage_date', today)
          .maybeSingle();

        return {
          id: k.id,
          key_prefix: k.key_prefix,
          tier: k.tier,
          daily_limit: k.daily_limit,
          is_active: k.is_active,
          created_at: k.created_at,
          count: usage?.request_count || 0
        };
      }));

      return NextResponse.json({ keys: keysWithUsage });
    }

    const authHeader = req.headers.get('authorization') || '';
    const headerKey = req.headers.get('x-api-key') || '';
    const queryKey = searchParams.get('key') || '';
    const rawKey = headerKey || queryKey || (authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '');

    if (!rawKey) {
      return NextResponse.json({ error: 'Missing x-api-key, Authorization Bearer token, or key param' }, { status: 400 });
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    if (!supabase) {
      return NextResponse.json({
        valid: true,
        tier: 'free',
        prefix: `${rawKey.slice(0, 14)}...`,
        count: 1,
        limit: 50,
        remaining: 49,
        allowed: true
      });
    }

    const { data: keyRecord, error: keyErr } = await supabase
      .from('api_keys')
      .select('tier, daily_limit, is_active, key_prefix')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (keyErr || !keyRecord || !keyRecord.is_active) {
      return NextResponse.json({ valid: false, reason: 'invalid_key' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: usageRecord } = await supabase
      .from('api_usage')
      .select('request_count')
      .eq('key_hash', keyHash)
      .eq('usage_date', today)
      .maybeSingle();

    const count = usageRecord?.request_count || 0;
    const limit = keyRecord.daily_limit;
    const remaining = Math.max(0, limit - count);

    return NextResponse.json({
      valid: true,
      tier: keyRecord.tier,
      prefix: keyRecord.key_prefix,
      count,
      limit,
      remaining,
      allowed: count < limit
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Revoke/delete an API key
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { keyPrefix, id } = body;

    if (!keyPrefix && !id) {
      return NextResponse.json({ error: 'Missing keyPrefix or id' }, { status: 400 });
    }

    if (supabase) {
      let query = supabase.from('api_keys').delete();
      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.eq('key_prefix', keyPrefix);
      }
      const { error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'API key revoked successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

