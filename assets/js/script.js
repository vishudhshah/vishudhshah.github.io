'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// SIDEBAR LOGIC

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// TESTIMONIALS LOGIC

// // testimonials variables
// const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
// const modalContainer = document.querySelector("[data-modal-container]");
// const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
// const overlay = document.querySelector("[data-overlay]");

// // modal variable
// const modalImg = document.querySelector("[data-modal-img]");
// const modalTitle = document.querySelector("[data-modal-title]");
// const modalText = document.querySelector("[data-modal-text]");

// // modal toggle function
// const testimonialsModalFunc = function () {
//     modalContainer.classList.toggle("active");
//     overlay.classList.toggle("active");
// }

// // add click event to all modal items
// for (let i = 0; i < testimonialsItem.length; i++) {

//     testimonialsItem[i].addEventListener("click", function () {

//         modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
//         modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
//         modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
//         modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

//         testimonialsModalFunc();

//     });

// }

// // add click event to modal close button
// modalCloseBtn.addEventListener("click", testimonialsModalFunc);
// overlay.addEventListener("click", testimonialsModalFunc);



// PROJECT FILTERING LOGIC

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        elementToggleFunc(select);
        filterFunc(selectedValue);

    });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

    for (let i = 0; i < filterItems.length; i++) {

        if (selectedValue === "all") {
            filterItems[i].classList.add("active");
        } else if (selectedValue === filterItems[i].dataset.category) {
            filterItems[i].classList.add("active");
        } else {
            filterItems[i].classList.remove("active");
        }

    }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

    filterBtn[i].addEventListener("click", function () {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;

    });

}



// CONTACT FORM LOGIC

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {

        // check form validation
        if (form.checkValidity()) {
            formBtn.removeAttribute("disabled");
        } else {
            formBtn.setAttribute("disabled", "");
        }

    });
}

// handle form submission
form.addEventListener("submit", function(e) {
    e.preventDefault(); // prevent default form submission
    
    // show loading state
    const originalText = formBtn.innerHTML;
    formBtn.innerHTML = '<span>Sending...</span>';
    formBtn.setAttribute("disabled", "");
    
    // prepare form data
    const formData = new FormData(form);
    
    // submit to Google Forms using fetch
    fetch(form.action, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // required for Google Forms
    })
    .then(() => {
        // success - show alert and reset form
        alert("Form submitted successfully!\nVishudh will get back to you soon.");
        form.reset();
        
        // reset button state
        formBtn.innerHTML = originalText;
        formBtn.setAttribute("enabled", "");
    })
    .catch((e) => {
        // error handling
        alert("There was an error submitting the form. Please try again later.\nAlternatively, you can reach out to Vishudh using his contact details provided in the sidebar.");
        console.error("Error details: ", e);

        // reset button state
        formBtn.innerHTML = originalText;
        if (form.checkValidity()) {
            formBtn.removeAttribute("disabled");
        }
    });
});



// PAGE NAVIGATION LOGIC

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// function to navigate to a specific page
const navigateToPage = function(pageName) {
    // First, remove active class from all pages and links
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
    }
    
    // Then add active class to the target page and link
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
        for (let i = 0; i < pages.length; i++) {
            if (pageName === pages[i].dataset.page) {
                pages[i].classList.add("active");
                navigationLinks[i].classList.add("active");
                window.scrollTo(0, 0);
            }
        }
    });
}

// add event to all nav links
for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function (e) {
        // The hash will be set by the anchor tag, and the hashchange event will handle navigation
        const pageName = this.getAttribute('href').substring(1); // Remove the # from href
        navigateToPage(pageName);
    });
}

// handle hash changes (back/forward navigation and direct URL access)
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1); // Remove the # from hash
    if (hash) {
        navigateToPage(hash);
    }
});

// handle initial page load with hash
window.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1); // Remove the # from hash
    if (hash) {
        navigateToPage(hash);
    } else {
        // Default to 'about' page if no hash
        navigateToPage('about');
    }
});