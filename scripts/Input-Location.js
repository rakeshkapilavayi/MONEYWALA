const config = {
    cUrl: "https://api.countrystatecity.in/v1/countries",
    ckey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
  };
  
  const stateInput = document.querySelector(".state"),
    cityInput = document.querySelector(".city"),
    stateSuggestions = document.querySelector(".state-suggestions"),
    citySuggestions = document.querySelector(".city-suggestions");
  
  let states = []; // Stores the fetched states
  let cities = []; // Stores the fetched cities
  
  // Load states when the page loads
  function loadStates() {
    fetch(`${config.cUrl}/IN/states`, { headers: { "X-CSCAPI-KEY": config.ckey } })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        states = data; // Save the state data for later use
      })
      .catch((error) => console.error("Error loading states:", error));
  }
  
  // Filter and display state suggestions
  function filterStates() {
    const query = stateInput.value.trim().toLowerCase();
    stateSuggestions.innerHTML = "";
  
    if (query.length < 2) return;
  
    const filteredStates = states.filter((state) =>
      state.name.toLowerCase().includes(query)
    );
  
    if (filteredStates.length === 0) {
      stateSuggestions.innerHTML = '<div class="no-suggestions">No matching states found</div>';
      return;
    }
  
    filteredStates.forEach((state) => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");
      div.textContent = state.name;
      div.onclick = () => selectState(state);
      stateSuggestions.appendChild(div);
    });
  }
  
  // Handle state selection
  function selectState(state) {
    stateInput.value = state.name;
    stateSuggestions.innerHTML = "";
    cityInput.disabled = false; // Enable city input
    cityInput.value = ""; // Clear city input
    citySuggestions.innerHTML = ""; // Clear city suggestions
    loadCities(state.iso2); // Load cities for the selected state
  }
  
  // Load cities for the selected state
  function loadCities(stateCode) {
    fetch(`${config.cUrl}/IN/states/${stateCode}/cities`, { headers: { "X-CSCAPI-KEY": config.ckey } })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        cities = data; // Store cities data for the selected state
      })
      .catch((error) => console.error("Error loading cities:", error));
  }
  
  // Filter and display city suggestions
  function filterCities() {
    const query = cityInput.value.trim().toLowerCase();
    citySuggestions.innerHTML = "";
  
    if (query.length < 2) return;
  
    const filteredCities = cities.filter((city) =>
      city.name.toLowerCase().includes(query)
    );
  
    if (filteredCities.length === 0) {
      citySuggestions.innerHTML = '<div class="no-suggestions">No matching cities found</div>';
      return;
    }
  
    filteredCities.forEach((city) => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");
      div.textContent = city.name;
      div.onclick = () => selectCity(city);
      citySuggestions.appendChild(div);
    });
  }
  
  // Handle city selection
  function selectCity(city) {
    cityInput.value = city.name;
    citySuggestions.innerHTML = "";
  }
  
  // Initialize the script when the window loads
  window.onload = loadStates;
  