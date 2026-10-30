'use client';
import { useEffect, useRef } from 'react';
import StarDetailPanel from './StarDetailPanel';
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';

/**
 * 离线解读面板 —— 手机 App 用来替代 InsightPanel
 *
 * App 里没有 /api/interpret，AI 解读用不了；这里只用本地数据：
 *  - 选中星曜的倪师解读（StarDetailPanel 内置的主星资料）
 *  - 命盘要点：命主身主、当前大限、生年四化落宫
 *    （ChartSummary 依赖 server-only 的 patterns.ts，静态导出的 App 里用不了）
 *
 * 显示哪颗星：点过的星 > 点过的宫的主星 > 命宫主星；空宫借对宫主星。
 */

export interface SelectedStar {
  star: Star;
  palaceName: string;
}

interface OfflineInsightProps {
  chart: ZiweiChart;
  selectedPalace: Palace | null;
  selectedStar: SelectedStar | null;
  closed: boolean;
  onClose: () => void;
}

function mainStarOf(chart: ZiweiChart, palace: Palace): SelectedStar | null {
  const own = palace.stars.find(s => s.type === 'major');
  if (own) return { star: own, palaceName: palace.name };
  const opposite = chart.palaces.find(p => p.branch === (palace.branch + 6) % 12);
  const borrowed = opposite?.stars.find(s => s.type === 'major');
  return borrowed ? { star: borrowed, palaceName: `${palace.name}（空宫借对宫）` } : null;
}

const SIHUA_ORDER = ['禄', '权', '科', '忌'];
const SIHUA_COLOR: Record<string, string> = {
  '禄': 'text-emerald-400', '权': 'text-sky-400', '科': 'text-yellow-400', '忌': 'text-red-400',
};

function ChartKeyPoints({ chart }: { chart: ZiweiChart }) {
  const dx = chart.daXians[chart.currentDaXianIndex];
  const siHua = chart.palaces
    .flatMap(p => p.stars.filter(s => s.siHua).map(s => ({ star: s.name, siHua: s.siHua!, palace: p.name })))
    .sort((a, b) => SIHUA_ORDER.indexOf(a.siHua) - SIHUA_ORDER.indexOf(b.siHua));
  const rows: [string, string][] = [
    ['命主 / 身主', `${chart.mingZhu ?? '—'} / ${chart.shenZhu ?? '—'}`],
    ['五行局', chart.wuxingJuName],
    ['当前大限', dx ? `${dx.startAge}–${dx.endAge}岁 · ${dx.palaceName}` : '—'],
  ];

  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
        <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>✦</span>
        命盘要点
      </div>
      <div className="space-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span style={{ color: 'var(--t-faint)' }}>{k}</span>
            <span style={{ color: 'var(--t-text)' }}>{v}</span>
          </div>
        ))}
      </div>
      {siHua.length > 0 && (
        <div className="mt-3 pt-3 space-y-1.5 text-sm" style={{ borderTop: '1px solid var(--t-border)' }}>
          <div className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--t-faint)' }}>生年四化</div>
          {siHua.map(h => (
            <div key={`${h.star}-${h.siHua}`} className="flex justify-between gap-3">
              <span><span className={SIHUA_COLOR[h.siHua]}>化{h.siHua}</span> {h.star}</span>
              <span style={{ color: 'var(--t-faint)' }}>入{h.palace}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OfflineInsight({ chart, selectedPalace, selectedStar, closed, onClose }: OfflineInsightProps) {
  const mingGong = chart.palaces.find(p => p.isMingGong);
  const shown = closed ? null
    : selectedStar
    ?? (selectedPalace && mainStarOf(chart, selectedPalace))
    ?? (mingGong && mainStarOf(chart, mingGong))
    ?? null;

  // 手机上面板在命盘下方：点了宫位/星曜后滚到解读处，否则看不到变化
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (shown) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [shown?.star.name, shown?.palaceName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className="space-y-4" style={{ scrollMarginTop: 16 }}>
      {shown ? (
        <StarDetailPanel star={shown.star} palaceName={shown.palaceName} onClose={onClose} />
      ) : (
        <div className="card-glass rounded-xl p-4 text-xs" style={{ color: 'var(--t-faint)' }}>
          点命盘上的宫位或星曜，查看倪师对该星的解读
        </div>
      )}
      <ChartKeyPoints chart={chart} />
    </div>
  );
}
