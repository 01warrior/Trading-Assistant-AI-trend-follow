import { useNews } from "../hooks/useNews";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import Skeleton from "react-loading-skeleton";

export function NewsPage() {
  const { news, isLoading } = useNews();

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Actualités du Marché
        </h1>
        <p className="text-gray-500 font-medium">
          Dernières informations de CoinDesk et CoinTelegraph.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px]">
              <Skeleton height={192} className="w-full" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton width={80} height={20} borderRadius={999} />
                  <Skeleton width={100} height={16} />
                </div>
                <Skeleton count={2} height={24} className="mb-2" />
                <Skeleton count={3} height={16} className="mb-4" />
                <Skeleton width={100} height={20} className="mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group flex flex-col overflow-hidden h-full"
            >
              {item.imageUrl && (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.source}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(item.pubDate).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                  {item.description}
                </p>
                <div className="flex items-center text-orange-500 text-sm font-semibold mt-auto">
                  Lire l'article <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            </a>
          ))}
          {news.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Newspaper className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Aucune actualité trouvée pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
