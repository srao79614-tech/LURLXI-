import React from 'react';
import { motion } from 'motion/react';
import { CategoryType } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { TrendingUp, Bot, ShoppingBag, Rocket, CheckCircle, BookOpen, MessageSquare, Compass } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const iconMap: Record<CategoryType, React.ReactNode> = {
    trading: <TrendingUp className="w-6 h-6 text-[#f8b179]" />,
    dropshipping: <Bot className="w-6 h-6 text-[#f8b179]" />,
    ecommerce: <ShoppingBag className="w-6 h-6 text-[#f8b179]" />,
    startup: <Rocket className="w-6 h-6 text-[#f8b179]" />,
    'skill-development': <Compass className="w-6 h-6 text-[#f8b179]" />,
  };

  const categories = Object.values(CATEGORIES_DATA);

  return (
    <section id="category-selector-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#1f293d]/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/15 text-[#f8b179] border border-[#d47a37]/30">
              <BookOpen className="w-3 h-3" /> Step 2: Select Operational Domain
            </span>
          </div>
          <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Executive Business Categories
          </h2>
          <p className="text-sm text-[#9ca3af] mt-1 max-w-2xl">
            Choose your core focus to unlock the full interactive knowledge codex, real-time AI solver, and media conversion analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          <span>5 Fully-Documented Encyclopedias Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <motion.div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id as CategoryType)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1c1611] to-[#0e1017] border-[#f8b179] shadow-[0_10px_35px_rgba(212,122,55,0.25)]'
                  : 'bg-[#0f121a]/90 hover:bg-[#151924] border-[#252c3d] hover:border-[#d47a37]/50'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <CheckCircle className="w-3 h-3" /> Selected Domain
                </div>
              )}

              <div>
                {/* Header with Icon and Page Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d47a37]/20 to-[#b85d19]/10 border border-[#d47a37]/30 flex items-center justify-center shadow-inner">
                    {iconMap[cat.id as CategoryType]}
                  </div>

                  <span className="text-xs font-mono font-medium text-[#f8b179] bg-[#d47a37]/10 px-2 py-1 rounded-md border border-[#d47a37]/20">
                    {cat.chapters.length} Chapters
                  </span>
                </div>

                <h3 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide mb-1.5 group-hover:text-[#f8b179] transition-colors">
                  {cat.title.split('&')[0]}
                </h3>

                <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2 mb-4">
                  {cat.shortDesc || cat.description}
                </p>

                {/* Primary Metric Stat */}
                <div className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] mb-4">
                  <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block">
                    {cat.stats?.[0]?.label || 'Curriculum Depth'}
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-bold text-[#f8b179] font-mono">
                      {cat.stats?.[0]?.value || `${cat.chapters?.length || 6} Codex Chapters`}
                    </span>
                    <span className="text-[10px] text-[#34d399] font-medium">
                      {cat.stats?.[0]?.change || '500p / Chapter'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Hint */}
              <div className="pt-3 border-t border-[#1f2638] flex items-center justify-between text-xs">
                <span className={`font-medium ${isSelected ? 'text-[#f8b179]' : 'text-[#6b7280]'}`}>
                  {isSelected ? 'Currently Loaded' : 'Click to Load'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#d47a37]">
                  <MessageSquare className="w-3 h-3" /> Ask AI
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
