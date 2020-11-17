---
layout: null
---
/*
 * Generic helper functions to implement services
 */
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function generateServiceLink(category, service) {
  const categoryParams = `page=${category.page}&identifier=${category.identifier}`;
  const serviceParams = `sub=${service.sub}&service_identifier=${service.identifier}`;
  const baseUrl = window.location.href.split('?')[0];
  return `${baseUrl}?${categoryParams}&${serviceParams}`;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function generateServiceMatchText(service, query) {
  const text = `${service.name.toLowerCase()} - ${service.category.name.toLowerCase()}`;
  return text.replace(query, `<b>${query}</b>`);
}

function generateResultNumberText(number) {
  if (number === 1) '1 Match Found';

  return `${number} Matches Found`
}

// We need to load the data from Jekyll into
// Javascript objects to facilitate looking up objects
const categoryData = []
const allServices = [];
let temporaryServices;
let serviceObject;
let categoryObject;
{% for category in site.data.categories %}
  categoryObject = {
    name: "{{ category.name }}",
    page: parseInt("{{ category.page }}") || '',
    identifier: "{{ category.identifier }}"
  };
  temporaryServices = [];
  {% for service in category.services %}
    serviceObject = {
      name: "{{ service.name }}",
      methodology: "{{ service.methodology }}",
      requirements: "{{ service.requirements }}",
      storage: "{{ service.storage }}",
      cptCode: "{{ service.cpt_code }}",
      time: "{{ service.time }}",
      sub: parseInt("{{ service.sub }}") || '',
      identifier: "{{ service.identifier }}",
      category: categoryObject
    };
    temporaryServices.push(serviceObject);
    allServices.push(serviceObject);
  {% endfor %}

  categoryObject.services = temporaryServices;
  categoryData.push(categoryObject);
{% endfor %}

document.addEventListener('DOMContentLoaded', function() {
  const searchResultsContainer = document.getElementById('search-results');

  // We want to hide the selected services elements on the page
  function hideSelectedService() {
    const servicesContainer = document.getElementById('services-container');
    servicesContainer.classList.add('hidden');
  }

  // Keyup listener for the services search field
  const searchFieldElement = document.getElementById('search-field');
  searchFieldElement.addEventListener('keyup', function(e) {
    removeAllChildNodes(searchResultsContainer);
    let searchValue = e.target.value;
    if (!searchValue || !searchValue.length) {
      return searchResultsContainer.classList.add('hidden');
    };

    searchValue = searchValue.toLowerCase();
    const matchingServices = allServices.filter(s => {
      if (s.name.toLowerCase().indexOf(searchValue) !== -1) return true;
      if (s.category.name.toLowerCase().indexOf(searchValue) !== -1) return true;

      return false;
    });

    // We found matches in the services! We render them on the page
    if (matchingServices && matchingServices.length) {
      const resultNumberElement = document.createElement('div');
      resultNumberElement.classList.add('text-center', 'result-number');
      resultNumberElement.innerText = generateResultNumberText(matchingServices.length);
      searchResultsContainer.appendChild(resultNumberElement);

      for (let i = 0; i < matchingServices.length; i++) {
        const matchingElement = document.createElement('a');
        matchingElement.classList.add('result-link');
        matchingElement.href = generateServiceLink(matchingServices[i].category, matchingServices[i]);
        matchingElement.innerHTML = generateServiceMatchText(matchingServices[i], searchValue);
        searchResultsContainer.appendChild(matchingElement);
      }
    } else {
      // No matches found :(
      const noResultsElement = document.createElement('div');
      noResultsElement.classList.add('text-center', 'no-result');
      noResultsElement.innerText = 'No Results Found';
      searchResultsContainer.appendChild(noResultsElement);
    }

    searchResultsContainer.classList.remove('hidden');
  });

  // In the old version of the website, we used page and sub to navigate
  // to a service. We first try to find an active category and service
  // through this method, then fallback to identifiers
  const currentPage = getUrlParameter('page');
  const currentSub = getUrlParameter('sub');
  const currentCategoryIdentifier = getUrlParameter('identifier');
  let activeCategory;
  let selectedService;
  if (currentPage || currentCategoryIdentifier) {
    activeCategory = categoryData.find(c => {
      if (c.page === parseInt(currentPage)) return true;
      if (c.identifier && c.identifier === currentCategoryIdentifier) return true;

      return false;
    });

    // Highlight the selected service and display the data
    // at the bottom of the page :)
    if (activeCategory && activeCategory.services) {
      selectedService = activeCategory.services.find(s => s.sub === parseInt(currentSub)) || activeCategory.services[0];

      if (selectedService) {
        const selectedServiceHeader = document.getElementById('selected-service-header');
        selectedServiceHeader.innerText = selectedService.name;

        const methodologyElement = document.getElementById('methodology');
        methodologyElement.innerText = selectedService.methodology;
        const collectionElement = document.getElementById('collection');
        collectionElement.innerText = selectedService.requirements;
        const storageElement = document.getElementById('storage');
        storageElement.innerText = selectedService.storage;
        const cptCodeElement = document.getElementById('cpt-code');
        cptCodeElement.innerText = selectedService.cptCode;
        const timeElement = document.getElementById('time')
        timeElement.innerText = selectedService.time;
      }
    }
  }

  /*
   * Highlight the active category HTML element
   */
  if (activeCategory) {
    const activeCategoryElement = document.getElementById(`category-${activeCategory.page}-${activeCategory.identifier}`);
    if (activeCategoryElement) {
      activeCategoryElement.classList.add('selected');
    }

    /*
     * Render the relevant services on the page
     */
    if (activeCategory.services && activeCategory.services.length) {
      const servicesLinksContainer = document.getElementById('services-links-container');
      for (let i = 0; i < activeCategory.services.length; i++) {
        const serviceContainerElement = document.createElement('div');
        serviceContainerElement.classList.add('col-12', 'col-sm-12', 'col-md-6', 'col-lg-4');

        const serviceLinkElement = document.createElement('a');
        serviceLinkElement.classList.add('mini-service-box', 'text-center');
        if (selectedService === activeCategory.services[i]) {
          serviceLinkElement.classList.add('selected');
        }
        serviceLinkElement.href = generateServiceLink(activeCategory, activeCategory.services[i]);
        serviceLinkElement.innerText = activeCategory.services[i].name;

        serviceContainerElement.appendChild(serviceLinkElement);
        servicesLinksContainer.appendChild(serviceContainerElement);
      }
    } else {
      hideSelectedService();
      const noServicesContainer = document.getElementById('no-services-container');
      noServicesContainer.classList.remove('hidden');
    }
  } else {
    hideSelectedService();
  }
});
