import { useState, useEffect } from 'react';

export interface NewsItem {
  id: string;
  title: string;
  pubDate: string;
  link: string;
  description: string;
  source: string;
  imageUrl?: string;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const urls = [
          { url: 'https://www.coindesk.com/arc/outboundfeeds/rss', name: 'CoinDesk' },
          { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' }
        ];

        const promises = urls.map(async (source) => {
          try {
            // Using allorigins as a free CORS proxy to fetch the RSS XML
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`);
            const data = await res.json();
            
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item"));
            
            return items.map(item => {
              const title = item.querySelector("title")?.textContent || "";
              const pubDate = item.querySelector("pubDate")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const rawDescription = item.querySelector("description")?.textContent || "";
              
              let imageUrl = "";
              
              // 1. Try enclosure
              const enclosure = item.querySelector("enclosure");
              if (enclosure) {
                imageUrl = enclosure.getAttribute("url") || "";
              }
              
              // 2. Try media:content
              if (!imageUrl) {
                const mediaContent = item.getElementsByTagNameNS("*", "content")[0];
                if (mediaContent) {
                  imageUrl = mediaContent.getAttribute("url") || "";
                }
              }

              // 3. Try extracting from description HTML before stripping
              if (!imageUrl) {
                const imgMatch = rawDescription.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                  imageUrl = imgMatch[1];
                }
              }

              // Strip HTML from description
              const description = rawDescription.replace(/<[^>]*>?/gm, '').trim();

              return {
                id: link || title,
                title,
                pubDate,
                link,
                description,
                source: source.name,
                imageUrl
              };
            });
          } catch (e) {
            console.error(`Error fetching ${source.name}`, e);
            return [];
          }
        });

        const results = await Promise.all(promises);
        
        // Flatten, sort by date descending
        const allNews = results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        
        // Remove duplicates by title (in case both sources report the exact same title)
        const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());

        setNews(uniqueNews);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, isLoading };
}
