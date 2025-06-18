class CountriesManager {
  constructor() {
    this.countries = {};
    this.searchTimeout = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadCountriesData();
      this.setupEventListeners();
      this.setupSearch();
    });
  }

  loadCountriesData() {
    // Datos de países organizados por región
    this.countries = {
      'north-america': [
        { name: 'Canadá', code: '+1', flag: 'ca' },
        { name: 'Estados Unidos', code: '+1', flag: 'us' },
        { name: 'México', code: '+52', flag: 'mx' }
      ],
      'central-america': [
        { name: 'Belice', code: '+501', flag: 'bz' },
        { name: 'Costa Rica', code: '+506', flag: 'cr' },
        { name: 'Cuba', code: '+53', flag: 'cu' },
        { name: 'El Salvador', code: '+503', flag: 'sv' },
        { name: 'Guatemala', code: '+502', flag: 'gt' },
        { name: 'Haití', code: '+509', flag: 'ht' },
        { name: 'Honduras', code: '+504', flag: 'hn' },
        { name: 'Jamaica', code: '+1-876', flag: 'jm' },
        { name: 'Nicaragua', code: '+505', flag: 'ni' },
        { name: 'Panamá', code: '+507', flag: 'pa' },
        { name: 'República Dominicana', code: '+1-809', flag: 'do' },
        { name: 'Trinidad y Tobago', code: '+1-868', flag: 'tt' }
      ],
      'south-america': [
        { name: 'Argentina', code: '+54', flag: 'ar' },
        { name: 'Bolivia', code: '+591', flag: 'bo' },
        { name: 'Brasil', code: '+55', flag: 'br' },
        { name: 'Chile', code: '+56', flag: 'cl' },
        { name: 'Colombia', code: '+57', flag: 'co' },
        { name: 'Ecuador', code: '+593', flag: 'ec' },
        { name: 'Guyana', code: '+592', flag: 'gy' },
        { name: 'Paraguay', code: '+595', flag: 'py' },
        { name: 'Perú', code: '+51', flag: 'pe' },
        { name: 'Surinam', code: '+597', flag: 'sr' },
        { name: 'Uruguay', code: '+598', flag: 'uy' },
        { name: 'Venezuela', code: '+58', flag: 've' }
      ],
      'western-europe': [
        { name: 'Alemania', code: '+49', flag: 'de' },
        { name: 'Austria', code: '+43', flag: 'at' },
        { name: 'Bélgica', code: '+32', flag: 'be' },
        { name: 'España', code: '+34', flag: 'es' },
        { name: 'Francia', code: '+33', flag: 'fr' },
        { name: 'Irlanda', code: '+353', flag: 'ie' },
        { name: 'Italia', code: '+39', flag: 'it' },
        { name: 'Luxemburgo', code: '+352', flag: 'lu' },
        { name: 'Países Bajos', code: '+31', flag: 'nl' },
        { name: 'Portugal', code: '+351', flag: 'pt' },
        { name: 'Reino Unido', code: '+44', flag: 'gb' },
        { name: 'Suiza', code: '+41', flag: 'ch' }
      ],
      'eastern-europe': [
        { name: 'Bulgaria', code: '+359', flag: 'bg' },
        { name: 'Croacia', code: '+385', flag: 'hr' },
        { name: 'Eslovaquia', code: '+421', flag: 'sk' },
        { name: 'Eslovenia', code: '+386', flag: 'si' },
        { name: 'Estonia', code: '+372', flag: 'ee' },
        { name: 'Hungría', code: '+36', flag: 'hu' },
        { name: 'Letonia', code: '+371', flag: 'lv' },
        { name: 'Lituania', code: '+370', flag: 'lt' },
        { name: 'Polonia', code: '+48', flag: 'pl' },
        { name: 'República Checa', code: '+420', flag: 'cz' },
        { name: 'Rumania', code: '+40', flag: 'ro' },
        { name: 'Rusia', code: '+7', flag: 'ru' },
        { name: 'Ucrania', code: '+380', flag: 'ua' }
      ],
      'asia': [
        { name: 'Arabia Saudita', code: '+966', flag: 'sa' },
        { name: 'China', code: '+86', flag: 'cn' },
        { name: 'Corea del Sur', code: '+82', flag: 'kr' },
        { name: 'Emiratos Árabes Unidos', code: '+971', flag: 'ae' },
        { name: 'Filipinas', code: '+63', flag: 'ph' },
        { name: 'Hong Kong', code: '+852', flag: 'hk' },
        { name: 'India', code: '+91', flag: 'in' },
        { name: 'Indonesia', code: '+62', flag: 'id' },
        { name: 'Israel', code: '+972', flag: 'il' },
        { name: 'Japón', code: '+81', flag: 'jp' },
        { name: 'Malasia', code: '+60', flag: 'my' },
        { name: 'Singapur', code: '+65', flag: 'sg' },
        { name: 'Tailandia', code: '+66', flag: 'th' },
        { name: 'Taiwán', code: '+886', flag: 'tw' },
        { name: 'Turquía', code: '+90', flag: 'tr' },
        { name: 'Vietnam', code: '+84', flag: 'vn' }
      ],
      'africa': [
        { name: 'Argelia', code: '+213', flag: 'dz' },
        { name: 'Egipto', code: '+20', flag: 'eg' },
        { name: 'Kenia', code: '+254', flag: 'ke' },
        { name: 'Marruecos', code: '+212', flag: 'ma' },
        { name: 'Nigeria', code: '+234', flag: 'ng' },
        { name: 'Sudáfrica', code: '+27', flag: 'za' },
        { name: 'Tanzania', code: '+255', flag: 'tz' },
        { name: 'Túnez', code: '+216', flag: 'tn' }
      ],
      'oceania': [
        { name: 'Australia', code: '+61', flag: 'au' },
        { name: 'Fiyi', code: '+679', flag: 'fj' },
        { name: 'Nueva Zelanda', code: '+64', flag: 'nz' },
        { name: 'Papúa Nueva Guinea', code: '+675', flag: 'pg' }
      ]
    };
  }

  setupEventListeners() {
    // Click en tarjetas de región
    document.querySelectorAll('.region-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.toggleRegion(card);
      });
    });

    // Click en países individuales
    document.querySelectorAll('.country-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectCountry(item);
      });
    });
  }

  setupSearch() {
    // Crear barra de búsqueda si no existe
    if (!document.querySelector('.countries-search')) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'countries-search-container';
      searchContainer.innerHTML = `
        <div class="countries-search">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Buscar país..." class="countries-search-input">
          <button class="countries-search-clear" style="display: none;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;

      const header = document.querySelector('.countries-header');
      if (header) {
        header.appendChild(searchContainer);
      }

      const searchInput = searchContainer.querySelector('.countries-search-input');
      const clearButton = searchContainer.querySelector('.countries-search-clear');

      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.searchCountries(e.target.value);
        }, 300);

        if (e.target.value.length > 0) {
          clearButton.style.display = 'block';
        } else {
          clearButton.style.display = 'none';
        }
      });

      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.display = 'none';
        this.clearSearch();
      });
    }
  }

  toggleRegion(card) {
    const isExpanded = card.classList.contains('expanded');
    
    // Cerrar todas las otras regiones
    document.querySelectorAll('.region-card').forEach(c => {
      if (c !== card) {
        c.classList.remove('expanded');
      }
    });

    // Toggle de la región actual
    card.classList.toggle('expanded');

    // Disparar evento personalizado
    const region = card.dataset.region;
    window.dispatchEvent(new CustomEvent('regionToggled', {
      detail: {
        region: region,
        expanded: !isExpanded,
        countries: this.countries[region] || []
      }
    }));
  }

  selectCountry(item) {
    // Remover selección anterior
    document.querySelectorAll('.country-item').forEach(c => {
      c.classList.remove('selected');
    });

    // Añadir selección actual
    item.classList.add('selected');

    const countryName = item.querySelector('.country-name').textContent;
    const countryCode = item.querySelector('.country-code').textContent;

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('countrySelected', {
      detail: {
        name: countryName,
        code: countryCode,
        element: item
      }
    }));

    console.log(`País seleccionado: ${countryName} ${countryCode}`);
  }

  searchCountries(query) {
    const regions = document.querySelectorAll('.region-card');
    
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    const searchTerm = query.toLowerCase();
    let hasResults = false;

    regions.forEach(region => {
      const countries = region.querySelectorAll('.country-item');
      let regionHasMatch = false;

      countries.forEach(country => {
        const countryName = country.querySelector('.country-name').textContent.toLowerCase();
        const countryCode = country.querySelector('.country-code').textContent.toLowerCase();
        
        const matches = countryName.includes(searchTerm) || countryCode.includes(searchTerm);
        
        if (matches) {
          country.style.display = 'flex';
          regionHasMatch = true;
          hasResults = true;
          
          // Destacar texto coincidente
          this.highlightSearchTerm(country, searchTerm);
        } else {
          country.style.display = 'none';
        }
      });

      // Mostrar/ocultar región según si tiene coincidencias
      if (regionHasMatch) {
        region.style.display = 'block';
        region.classList.add('expanded');
      } else {
        region.style.display = 'none';
      }
    });

    // Mostrar mensaje si no hay resultados
    this.toggleNoResults(!hasResults, query);
  }

  highlightSearchTerm(countryItem, searchTerm) {
    const nameElement = countryItem.querySelector('.country-name');
    const codeElement = countryItem.querySelector('.country-code');
    
    [nameElement, codeElement].forEach(element => {
      const text = element.textContent;
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const highlightedText = text.replace(regex, '<mark>$1</mark>');
      element.innerHTML = highlightedText;
    });
  }

  clearSearch() {
    // Mostrar todas las regiones y países
    document.querySelectorAll('.region-card').forEach(region => {
      region.style.display = 'block';
      region.classList.remove('expanded');
      
      region.querySelectorAll('.country-item').forEach(country => {
        country.style.display = 'flex';
        
        // Limpiar highlights
        const nameElement = country.querySelector('.country-name');
        const codeElement = country.querySelector('.country-code');
        [nameElement, codeElement].forEach(element => {
          element.innerHTML = element.textContent;
        });
      });
    });

    this.toggleNoResults(false);
  }

  toggleNoResults(show, query = '') {
    let noResultsElement = document.querySelector('.no-results-message');
    
    if (show && !noResultsElement) {
      noResultsElement = document.createElement('div');
      noResultsElement.className = 'no-results-message';
      noResultsElement.innerHTML = `
        <div class="no-results-content">
          <i class="fas fa-search"></i>
          <h3>No se encontraron resultados</h3>
          <p>No hay países que coincidan con "${query}"</p>
        </div>
      `;
      
      const regionsGrid = document.querySelector('.regions-grid');
      if (regionsGrid) {
        regionsGrid.parentNode.insertBefore(noResultsElement, regionsGrid);
      }
    } else if (!show && noResultsElement) {
      noResultsElement.remove();
    }
  }

  // Método público para obtener información de país
  getCountryInfo(countryName) {
    for (const [region, countries] of Object.entries(this.countries)) {
      const country = countries.find(c => 
        c.name.toLowerCase() === countryName.toLowerCase()
      );
      if (country) {
        return { ...country, region };
      }
    }
    return null;
  }

  // Método público para obtener países por región
  getCountriesByRegion(region) {
    return this.countries[region] || [];
  }

  // Método público para obtener estadísticas
  getStats() {
    const totalCountries = Object.values(this.countries)
      .reduce((total, countries) => total + countries.length, 0);
    
    return {
      totalCountries,
      totalRegions: Object.keys(this.countries).length,
      regions: Object.keys(this.countries).map(region => ({
        name: region,
        count: this.countries[region].length
      }))
    };
  }
}

// Crear instancia global
window.countriesManager = new CountriesManager();

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CountriesManager;
}