// DOM elements
const destinationsContainer = document.querySelector('#destinations');
const destinationsList = document.querySelector('#destinations');
const secondOverlay = document.querySelector('.second-overlay');
const searchInput = document.querySelector('.destination');
const closeBtn = document.getElementById('close');
const searchBtn = document.getElementById('search');

// Event listeners
searchInput.addEventListener('focus', handleInputFocus);
searchInput.addEventListener('keydown', handleKeydown);
searchInput.addEventListener('input', handleInputChange);
searchBtn.addEventListener('click', performSearch);
secondOverlay.addEventListener('click', hideDestinations);
closeBtn.addEventListener('click', hideDestinations);

// Global data cache
let travelData = null;

async function getDestinations() {
  try {
    const res = await fetch('./data/travel_recommendation_api.json');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json(); 
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error.message);
    return null;
  }
}

function handleInputFocus() {
  if (travelData) {
    showAllDestinations();
  }
  showDestinations();
}

function handleInputChange() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    if (travelData) {
      showAllDestinations();
    }
  } else {
    performSearch();
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

async function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    if (travelData) {
      showAllDestinations();
    }
    return;
  }

  if (!travelData) {
    travelData = await getDestinations();
  }

  if (!travelData) {
    showError('Failed to load travel data');
    return;
  }

  const results = searchDestinations(searchTerm, travelData);
  displayResults(results);
}

function searchDestinations(searchTerm, data) {
  const results = [];

  if (data.countries) {
    data.countries.forEach((country) => {
      if (country.name.toLowerCase().includes(searchTerm)) {
        country.cities.forEach((city) => {
          results.push({
            type: 'Country',
            name: city.name,
            imageUrl: city.imageUrl,
            description: city.description,
          });
        });
      } else {
        country.cities.forEach((city) => {
          if (city.name.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'Country',
              name: city.name,
              imageUrl: city.imageUrl,
              description: city.description,
            });
          }
        });
      }
    });
  }

  if (data.temples) {
    data.temples.forEach((temple) => {
      if (temple.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'Temple',
          name: temple.name,
          imageUrl: temple.imageUrl,
          description: temple.description,
        });
      }
    });
  }

  if (data.beaches) {
    data.beaches.forEach((beach) => {
      if (beach.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'Beach',
          name: beach.name,
          imageUrl: beach.imageUrl,
          description: beach.description,
        });
      }
    });
  }

  return results;
}

function displayResults(results) {
  destinationsList.innerHTML = '';

  if (results.length === 0) {
    destinationsList.innerHTML = '<p>No destinations found</p>';
    showDestinations();
    return;
  }

  const groupedResults = {};
  results.forEach((result) => {
    if (!groupedResults[result.type]) {
      groupedResults[result.type] = [];
    }
    groupedResults[result.type].push(result);
  });

  Object.keys(groupedResults).forEach((type) => {
    const typeSection = document.createElement('div');
    typeSection.className = 'destination-type';

    const typeTitle = document.createElement('h3');
    typeTitle.textContent = type;
    typeSection.appendChild(typeTitle);

    const destinationsList = document.createElement('ul');
    destinationsList.className = 'destinations';

    groupedResults[type].forEach((destination) => {
      const card = createDestinationCard(destination);
      destinationsList.appendChild(card);
    });

    typeSection.appendChild(destinationsList);
    destinationsContainer.appendChild(typeSection);
  });

  showDestinations();
}

function createDestinationCard(destination) {
  const listItem = document.createElement('li');
  listItem.className = 'destination-card';

  listItem.innerHTML = `
    <img src="${destination.imageUrl}" alt="${destination.name}" />
    <h4>${destination.name}</h4>
    <p>${destination.description}</p>
    <button type="button">
      <a href="./src/contact_us.html">Visit</a>
    </button>
  `;

  return listItem;
}

function showDestinations() {
  destinationsList.classList.remove('hidden');
  secondOverlay.classList.remove('hidden');
}

function hideDestinations() {
  destinationsList.classList.add('hidden');
  secondOverlay.classList.add('hidden');
  searchInput.value = '';
}

function showError(message) {
  destinationsList.innerHTML = `<p class="error">${message}</p>`;
  showDestinations();
}

document.addEventListener('DOMContentLoaded', async () => {
  travelData = await getDestinations();
});

function showAllDestinations() {
  const allDestinations = getAllDestinations(travelData);
  displayResults(allDestinations);
}

function getAllDestinations(data) {
  const allDestinations = [];

  if (data.countries) {
    data.countries.forEach((country) => {
      country.cities.forEach((city) => {
        allDestinations.push({
          type: 'Country',
          name: city.name,
          imageUrl: city.imageUrl,
          description: city.description,
        });
      });
    });
  }

  if (data.temples) {
    data.temples.forEach((temple) => {
      allDestinations.push({
        type: 'Temple',
        name: temple.name,
        imageUrl: temple.imageUrl,
        description: temple.description,
      });
    });
  }

  if (data.beaches) {
    data.beaches.forEach((beach) => {
      allDestinations.push({
        type: 'Beach',
        name: beach.name,
        imageUrl: beach.imageUrl,
        description: beach.description,
      });
    });
  }

  return allDestinations;
}
