const prices = {
  // Оптовые цены
  wholesale: {
    '200x200': {
      transparent_frost_standard: 180,
      colored_china: 200,
      colored_france: 270,
      transparent_ribbed_france: 180,
      eco: 150,
    },
    '300x300': {
      transparent_frost_standard: 290,
      transparent_ribbed_frost: 360,
      matte: 280,
      screenflex_welding: 360,
      eco: 250,
    },
  },
  // Розничные цены
  retail: {
    '200x200': {
      transparent_frost_standard: 195,
      colored_china: 220,
      colored_france: 295,
      transparent_ribbed_france: 195,
      eco: 165,
    },
    '300x300': {
      transparent_frost_standard: 305,
      transparent_ribbed_frost: 395,
      matte: 295,
      screenflex_welding: 395,
      eco: 265,
    },
  },
};

const fastenersPrices = {
  // Оптовые цены на крепежи
  wholesale: {
    galvanized: {
      plank_200: 50,
      plank_300: 60,
      comb: 285, // За 1 комплект
    },
    stainless: {
      plank_200: 80,
      plank_300: 90,
      comb: 550, // За 1 комплект
    },
  },
  // Розничные цены на крепежи
  retail: {
    galvanized: {
      plank_200: 65,
      plank_300: 75,
      comb: 295, // За 1 комплект
    },
    stainless: {
      plank_200: 85,
      plank_300: 105,
      comb: 550, // За 1 комплект
    },
  },
};

const stripsPerMeter = {
  '200x200': {
    galvanized: { '40mm': 6, '80mm': 8 },
    stainless: { '50mm': 7, '100mm': 10 },
  },
  '300x300': {
    galvanized: { '40mm': 4, '80mm': 4.8 },
    stainless: { '50mm': 4, '100mm': 5 },
  },
};

// Функция для динамического заполнения вариантов перекрытия
function populateOverlapOptions() {
  const fastenersInputs = document.getElementsByName('fasteners');
  let fasteners;
  for (const input of fastenersInputs) {
    if (input.checked) {
      fasteners = input.value;
      break;
    }
  }

  const overlapOptions = document.getElementById('overlap-options');
  overlapOptions.innerHTML = '';

  if (fasteners === 'galvanized') {
    overlapOptions.innerHTML = `
      <label>
        <input type="radio" name="overlap" value="40mm" onchange="calculateCost()">
        40 мм
      </label>
      <label>
        <input type="radio" name="overlap" value="80mm" onchange="calculateCost()">
        80 мм
      </label>
    `;
  } else if (fasteners === 'stainless') {
    overlapOptions.innerHTML = `
      <label>
        <input type="radio" name="overlap" value="50mm" onchange="calculateCost()">
        50 мм
      </label>
      <label>
        <input type="radio" name="overlap" value="100mm" onchange="calculateCost()">
        100 мм
      </label>
    `;
  } else {
    overlapOptions.innerHTML = '<p>Сначала выберите тип крепежей.</p>';
  }
}

// Добавляем обработчики событий для радиокнопок крепежей
const fastenersInputs = document.getElementsByName('fasteners');
for (const input of fastenersInputs) {
  input.addEventListener('change', () => {
    populateOverlapOptions();
    calculateCost();
  });
}

function calculateCost() {
  // Получаем выбранный тип завесы
  const typeInputs = document.getElementsByName('type');
  let selectedType;
  for (const input of typeInputs) {
    if (input.checked) {
      selectedType = input.value;
      break;
    }
  }

  // Получаем размеры проёма в мм
  const widthMm = parseFloat(document.getElementById('width').value) || 0;
  const heightMm = parseFloat(document.getElementById('height').value) || 0;

  const widthM = widthMm / 1000; // переводим мм в метры
  const heightM = heightMm / 1000; // переводим мм в метры

  // Получаем выбранный тип крепежей
  const fastenersInputs = document.getElementsByName('fasteners');
  let fasteners;
  for (const input of fastenersInputs) {
    if (input.checked) {
      fasteners = input.value;
      break;
    }
  }

  // Получаем выбранное перекрытие
  const overlapInputs = document.getElementsByName('overlap');
  let overlap;
  for (const input of overlapInputs) {
    if (input.checked) {
      overlap = input.value;
      break;
    }
  }

  // Проверки ввода
  if (!selectedType) {
    document.getElementById('result').innerHTML = '<p>Выберите тип завесы.</p>';
    return;
  }
  if (!fasteners) {
    document.getElementById('result').innerHTML = '<p>Выберите тип крепежей.</p>';
    return;
  }
  if (!overlap) {
    document.getElementById('result').innerHTML = '<p>Выберите перекрытие.</p>';
    return;
  }
  if (widthMm <= 0 || heightMm <= 0) {
    document.getElementById('result').innerHTML =
      '<p>Укажите корректные размеры проёма (больше 0).</p>';
    return;
  }

  // Определяем размер завесы на основе выбранного типа
  let size;
  let typeKey;
  if (selectedType.startsWith('200x200')) {
    size = '200x200';
    typeKey = selectedType.replace('200x200_', '');
  } else if (selectedType.startsWith('300x300')) {
    size = '300x300';
    typeKey = selectedType.replace('300x300_', '');
  }

  // Рассчитываем количество полос
  const stripsPerM = stripsPerMeter[size][fasteners][overlap];
  const totalStrips = Math.ceil(stripsPerM * widthM); // Округляем вверх

  // Общее количество материала (в погонных метрах)
  const totalMaterial = totalStrips * heightM;

  // Стоимость материала для опта и розницы
  const materialCostWholesale = totalMaterial * prices.wholesale[size][typeKey];
  const materialCostRetail = totalMaterial * prices.retail[size][typeKey];

  // Количество планок и их стоимость (разная для опта и розницы)
  const plankSize = size === '200x200' ? 'plank_200' : 'plank_300';
  const plankCostWholesale = fastenersPrices.wholesale[fasteners][plankSize];
  const plankCostRetail = fastenersPrices.retail[fasteners][plankSize];

  const totalPlanks = totalStrips; // Одна планка на каждую полосу
  const planksCostWholesale = totalPlanks * plankCostWholesale;
  const planksCostRetail = totalPlanks * plankCostRetail;

  // Количество гребёнок - ВСЕГДА 1 комплект на проем (разная цена для опта и розницы)
  const totalCombs = 1;
  const combCostWholesale = fastenersPrices.wholesale[fasteners]['comb'];
  const combCostRetail = fastenersPrices.retail[fasteners]['comb'];

  const combsCostWholesale = totalCombs * combCostWholesale;
  const combsCostRetail = totalCombs * combCostRetail;

  // Общая стоимость без изготовления
  const subtotalWholesale = materialCostWholesale + planksCostWholesale + combsCostWholesale;
  const subtotalRetail = materialCostRetail + planksCostRetail + combsCostRetail;

  // Добавляем проценты за изготовление (7% для опта, 12% для розницы)
  const manufacturingFeeWholesale = subtotalWholesale * 0.07;
  const manufacturingFeeRetail = subtotalRetail * 0.12;

  const totalCostWholesale = subtotalWholesale + manufacturingFeeWholesale;
  const totalCostRetail = subtotalRetail + manufacturingFeeRetail;

  // Отображаем обе итоговые стоимости
  document.getElementById('result').innerHTML = `
    <div class="pricing-container">
      <div class="price-block wholesale">
        <h3>Оптовая цена</h3>
        <div class="total-cost">${totalCostWholesale.toFixed(2)} руб</div>
        <div class="price-details">
          <p>Полосы: ${totalStrips} шт × ${heightM.toFixed(1)} м</p>
          <p>Материал: ${materialCostWholesale.toFixed(2)} руб</p>
          <p>Планки: ${planksCostWholesale.toFixed(2)} руб</p>
          <p>Гребенка: ${combsCostWholesale.toFixed(2)} руб</p>
          <p>Изготовление (7%): ${manufacturingFeeWholesale.toFixed(2)} руб</p>
        </div>
      </div>
      <div class="price-block retail">
        <h3>Розничная цена</h3>
        <div class="total-cost">${totalCostRetail.toFixed(2)} руб</div>
        <div class="price-details">
          <p>Полосы: ${totalStrips} шт × ${heightM.toFixed(1)} м</p>
          <p>Материал: ${materialCostRetail.toFixed(2)} руб</p>
          <p>Планки: ${planksCostRetail.toFixed(2)} руб</p>
          <p>Гребенка: ${combsCostRetail.toFixed(2)} руб</p>
          <p>Изготовление (12%): ${manufacturingFeeRetail.toFixed(2)} руб</p>
        </div>
      </div>
    </div>
  `;
}

// Инициализация перекрытий при загрузке страницы
populateOverlapOptions();
