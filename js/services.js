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
  return `/home/services?${categoryParams}&${serviceParams}`;
}

// We need to load the data from Jekyll into
// Javascript objects to facilitate looking up objects
const categoryData = []
let temporaryServices;
{% for category in site.data.categories %}
  temporaryServices = [];
  {% for service in category.services %}
    temporaryServices.push({
      name: "{{ service.name }}",
      methodology: "{{ service.methodology }}",
      requirements: "{{ service.requirements }}",
      storage: "{{ service.storage }}",
      cpt_code: "{{ service.cpt_code }}",
      time: "{{ service.time }}",
      sub: parseInt("{{ service.sub }}"),
      identifier: "{{ service.identifier }}"
    });
  {% endfor %}

  categoryData.push({
    name: "{{ category.name }}",
    page: parseInt("{{ category.page }}"),
    identifier: "{{ category.identifier }}",
    services: temporaryServices
  });
{% endfor %}

document.addEventListener('DOMContentLoaded', function() {
  const servicesContainer = document.getElementById('services-container');

  // In the old version of the website, we used page and sub to navigate
  // to a service. We first try to find an active category and service
  // through this method
  const currentPage = getUrlParameter('page');
  const currentSub = getUrlParameter('sub');
  const currentCategoryIdentifier = getUrlParameter('identifer');
  let activeCategory;
  let selectedService;
  if (currentPage) {
    activeCategory = categoryData.find(c => {
      if (c.page === parseInt(currentPage)) return true;
      if (c.identifier && c.identifier === currentCategoryIdentifier) return true;

      return false;
    });

    // Highlight the selected service and display the data :)
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
        cptCodeElement.innerText = selectedService.cpt_code;
        const timeElement = document.getElementById('time')
        timeElement.innerText = selectedService.time;
      }
    }
  }

  /*
   * Highlight the active category HTML element and show the relevant
   * services on the page
   */
  if (activeCategory) {
    const activeCategoryElement = document.getElementById(`category-${activeCategory.page}-${activeCategory.identifier}`);
    if (activeCategoryElement) {
      activeCategoryElement.classList.add('selected');
    }

    /*
     * Render the relevant services on the page
     */
    if (activeCategory.services) {
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
    }
  } else {
    // We want to hide the selected services elements on the page
    servicesContainer.classList.add('hidden');
  }
});
