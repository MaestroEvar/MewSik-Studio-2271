// Цвета ролей котов - те же, что в редакторе паттернов.
export const ROLE_COLORS = {
  Lead:  '#a78bfa',
  Bass:  '#f472b6',
  Pad:   '#34d399',
  Drums: '#fbbf24',
};

// Фиксированный порядок категорий - чтобы градиент рамки был стабильным
// и не прыгал в зависимости от порядка добавления звуков.
const CATEGORY_ORDER = ['Lead', 'Bass', 'Pad', 'Drums'];

// Какие категории звуков реально присутствуют в паттерне (в фикс. порядке).
export function categoriesInBlocks(blocks) {
  const set = new Set((blocks || []).map((b) => b.category));
  return CATEGORY_ORDER.filter((c) => set.has(c));
}

// Цвет-представитель паттерна (первая присутствующая категория).
// Используется там, где нужен один цвет (например подсветка при наведении).
export function representativeColor(blocks) {
  const cats = categoriesInBlocks(blocks);
  return cats.length ? ROLE_COLORS[cats[0]] : '#7c3aed';
}

// Стиль рамки паттерна по типам котов внутри него:
//   - одна категория  -> сплошная рамка её цветом (только drums = оранжевая)
//   - несколько        -> градиентная рамка из цветов этих категорий
//   - все четыре       -> градиент из четырёх цветов
// innerBg - цвет фона элемента (нужен для трюка с градиентной рамкой,
// чтобы скруглённые углы не ломались, в отличие от border-image).
export function getPatternBorderStyle(blocks, innerBg = '#242424') {
  const colors = categoriesInBlocks(blocks).map((c) => ROLE_COLORS[c]);

  if (colors.length === 0) {
    // Пустой паттерн - нейтральная рамка
    return { border: '2px solid #323131' };
  }
  if (colors.length === 1) {
    return { border: `2px solid ${colors[0]}` };
  }

  // Градиентная рамка: один слой-фон под контентом + градиент в области рамки
  const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;
  return {
    border: '2px solid transparent',
    background: `linear-gradient(${innerBg}, ${innerBg}) padding-box, ${gradient} border-box`,
  };
}
