export interface OpenAlexWork {
  id: string;
  title: string;
  abstract_inverted_index?: Record<string, number[]> | null;
  publication_year?: number | null;
  doi?: string | null;
  authorships?: Array<{
    author: {
      id: string;
      display_name: string;
    };
  }> | null;
  primary_location?: {
    landing_page_url?: string | null;
  } | null;
}

export function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined | null): string {
  if (!invertedIndex) return '';
  
  let maxPos = -1;
  const entries = Object.entries(invertedIndex);
  for (const [, positions] of entries) {
    for (const pos of positions) {
      if (pos > maxPos) {
        maxPos = pos;
      }
    }
  }
  
  if (maxPos === -1) return '';
  
  const words: string[] = new Array(maxPos + 1).fill('');
  for (const [word, positions] of entries) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  
  // Clean up any empty indices (just in case) and join
  return words.filter(w => w !== '').join(' ');
}

export async function fetchPapersFromOpenAlex(query: string, limit = 50): Promise<any[]> {
  const mailto = process.env.OPENALEX_MAILTO || 'team@thesignoftimes.com';
  // Standard API format with has_abstract filter
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=has_abstract:true&limit=${limit}&select=id,title,abstract_inverted_index,publication_year,authorships,doi,primary_location&mailto=${encodeURIComponent(mailto)}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': `TSOT/1.0 (mailto:${mailto})`
    }
  });
  
  if (!res.ok) {
    throw new Error(`OpenAlex error: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  const results: OpenAlexWork[] = data.results ?? [];
  
  return results.map(work => {
    const abstractText = reconstructAbstract(work.abstract_inverted_index);
    const authors = work.authorships
      ?.map(a => a.author.display_name)
      .join(', ') ?? null;
      
    const sourceUrl = work.doi ?? work.primary_location?.landing_page_url ?? null;
    
    return {
      title: work.title,
      abstract: abstractText,
      year: work.publication_year ?? null,
      authors,
      sourceUrl,
      id: work.id
    };
  });
}
