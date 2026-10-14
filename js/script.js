/**
 * Vehicle Service Booking & Cost Estimation System
 * Course: Web Development & Applications (PHP/JS)
 * File: js/script.js
 * Description: Client-side validation, dynamic DOM updates, real-time cost calculation,
 *              and Digit 6 bundle discount logic.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // --- Form & Input Elements ---
  const bookingForm          = document.getElementById('serviceBookingForm');
  const customerNameInput    = document.getElementById('customerName');
  const phoneNumberInput     = document.getElementById('phoneNumber');
  const emailAddressInput    = document.getElementById('emailAddress');
  const vehicleRegInput      = document.getElementById('vehicleReg');
  const vehicleTypeSelect    = document.getElementById('vehicleType');
  const manufactureYearInput = document.getElementById('manufactureYear');
  const serviceDateInput     = document.getElementById('serviceDate');

  // --- Dynamic Output Containers ---
  const vehicleTipBox        = document.getElementById('vehicleTipBox');
  const summaryVehicleType   = document.getElementById('summaryVehicleType');
  const selectedServicesList = document.getElementById('selectedServicesList');
  const totalCostDisplay     = document.getElementById('totalCostDisplay');
  const digit6PromoBanner    = document.getElementById('digit6PromoBanner');
  const diagnosisPriceTag    = document.getElementById('diagnosisPriceTag');
  const serviceCheckboxes    = document.querySelectorAll('.service-checkbox');

  // --- Field Error Spans ---
  const errors = {
    customerName:    document.getElementById('customerNameError'),
    phoneNumber:     document.getElementById('phoneNumberError'),
    emailAddress:    document.getElementById('emailAddressError'),
    vehicleReg:      document.getElementById('vehicleRegError'),
    vehicleType:     document.getElementById('vehicleTypeError'),
    manufactureYear: document.getElementById('manufactureYearError'),
    serviceDate:     document.getElementById('serviceDateError'),
    services:        document.getElementById('servicesError')
  };

  // --- Catalog Prices (KSh) ---
  const SERVICE_PRICES = {
    'Engine Oil Change': 3000,
    'Brake Inspection': 2000,
    'Wheel Alignment': 2500,
    'Computer Diagnosis': 3500,
    'Full Service': 8000
  };

  // --- Vehicle Specific Advisories (Dynamic Feature 1) ---
  const VEHICLE_ADVISORIES = {
    'Saloon Car': {
      title: 'Saloon Car Maintenance',
      desc: 'Standard passenger chassis. Service focuses on engine oil quality, air filters, spark plugs, and tire balancing.'
    },
    'SUV': {
      title: 'SUV Maintenance',
      desc: 'Heavier vehicle with elevated suspension. Service includes inspection of 4WD/AWD transfer box, shock absorbers, and suspension bushings.'
    },
    'Pickup': {
      title: 'Commercial Pickup Maintenance',
      desc: 'Utility load carrier. Inspection includes rear leaf springs, differential gear oil level, and load-sensing brake valves.'
    },
    'Van': {
      title: 'Passenger / Cargo Van Maintenance',
      desc: 'High-usage commercial transit. Checks emphasize engine cooling efficiency, brake pad wear limits, and transmission fluid condition.'
    }
  };


  // ============================================================================
  // HELPER FUNCTIONS: INLINE ERROR HANDLING
  // ============================================================================
  // --- DEMO EXPLANATION ---
  // In place of window.alert() popups, these helpers show inline text messages
  // directly under each field and toggle the .is-invalid CSS state.
  function setFieldError(inputEl, errorEl, message) {
    if (errorEl) errorEl.textContent = message;
    if (inputEl) {
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
    }
  }

  function clearFieldError(inputEl, errorEl) {
    if (errorEl) errorEl.textContent = '';
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    }
  }


  // ============================================================================
  // FUNCTION 1: FORM VALIDATION (validateServiceForm)
  // ============================================================================
  /**
   * --- DEMO EXPLANATION: JAVASCRIPT VALIDATION ---
   * Triggered on the form onsubmit event.
   * Validates:
   * 1. Customer Name: Not empty, trimmed.
   * 2. Phone Number: Exactly 10 digits (/^[0-9]{10}$/).
   * 3. Email Address: Valid email syntax (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).
   * 4. Vehicle Registration: Provided and trimmed.
   * 5. Vehicle Type: Non-empty dropdown choice.
   * 6. Manufacture Year: Numeric value between 1990 and 2026.
   * 7. Service Date: Date must be chosen.
   * 8. Services: At least one checkbox must be checked.
   * If any check fails, event.preventDefault() stops the form submission.
   */
  function validateServiceForm(event) {
    let isValid = true;

    // 1. Name validation
    const nameVal = customerNameInput.value.trim();
    if (nameVal === '') {
      setFieldError(customerNameInput, errors.customerName, 'Customer name is required.');
      isValid = false;
    } else if (nameVal.length < 2) {
      setFieldError(customerNameInput, errors.customerName, 'Customer name must be at least 2 characters.');
      isValid = false;
    } else {
      clearFieldError(customerNameInput, errors.customerName);
    }

    // 2. Phone validation (exactly 10 digits)
    const phoneVal = phoneNumberInput.value.trim();
    const phonePattern = /^[0-9]{10}$/;
    if (phoneVal === '') {
      setFieldError(phoneNumberInput, errors.phoneNumber, 'Phone number is required.');
      isValid = false;
    } else if (!phonePattern.test(phoneVal)) {
      setFieldError(phoneNumberInput, errors.phoneNumber, 'Phone number must be exactly 10 digits (e.g. 0712345678).');
      isValid = false;
    } else {
      clearFieldError(phoneNumberInput, errors.phoneNumber);
    }

    // 3. Email validation
    const emailVal = emailAddressInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailVal === '') {
      setFieldError(emailAddressInput, errors.emailAddress, 'Email address is required.');
      isValid = false;
    } else if (!emailPattern.test(emailVal)) {
      setFieldError(emailAddressInput, errors.emailAddress, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailAddressInput, errors.emailAddress);
    }

    // 4. Vehicle Registration validation
    const regVal = vehicleRegInput.value.trim();
    if (regVal === '') {
      setFieldError(vehicleRegInput, errors.vehicleReg, 'Vehicle registration is required.');
      isValid = false;
    } else {
      clearFieldError(vehicleRegInput, errors.vehicleReg);
    }

    // 5. Vehicle Type validation
    if (vehicleTypeSelect.value === '') {
      setFieldError(vehicleTypeSelect, errors.vehicleType, 'Please select a vehicle type.');
      isValid = false;
    } else {
      clearFieldError(vehicleTypeSelect, errors.vehicleType);
    }

    // 6. Year of Manufacture validation (1990 - 2026)
    const yearVal = parseInt(manufactureYearInput.value, 10);
    if (manufactureYearInput.value.trim() === '' || isNaN(yearVal)) {
      setFieldError(manufactureYearInput, errors.manufactureYear, 'Year of manufacture is required.');
      isValid = false;
    } else if (yearVal < 1990 || yearVal > 2026) {
      setFieldError(manufactureYearInput, errors.manufactureYear, 'Year must be between 1990 and 2026.');
      isValid = false;
    } else {
      clearFieldError(manufactureYearInput, errors.manufactureYear);
    }

    // 7. Preferred Service Date validation
    if (serviceDateInput.value === '') {
      setFieldError(serviceDateInput, errors.serviceDate, 'Please choose a service date.');
      isValid = false;
    } else {
      clearFieldError(serviceDateInput, errors.serviceDate);
    }

    // 8. Services selection validation (at least one must be checked)
    const anyChecked = Array.from(serviceCheckboxes).some(cb => cb.checked);
    if (!anyChecked) {
      errors.services.textContent = 'Please select at least one service.';
      isValid = false;
    } else {
      errors.services.textContent = '';
    }

    // Halt submission if any rule failed
    if (!isValid) {
      event.preventDefault();
      return false;
    }

    return true;
  }


  // ============================================================================
  // FUNCTION 2: DYNAMIC VEHICLE INFO (updateVehicleInfo) - Dynamic Feature 1
  // ============================================================================
  /**
   * --- DEMO EXPLANATION: DYNAMIC DOM UPDATES (VEHICLE TYPE) ---
   * Triggered by the onchange event of the vehicleType dropdown.
   * Reads the selected option value, finds the corresponding entry in VEHICLE_ADVISORIES,
   * and updates #vehicleTipBox and #summaryVehicleType without reloading the page.
   */
  function updateVehicleInfo() {
    const selectedType = vehicleTypeSelect.value;

    if (selectedType && VEHICLE_ADVISORIES[selectedType]) {
      const advisory = VEHICLE_ADVISORIES[selectedType];
      vehicleTipBox.innerHTML = `<strong>Advisory: ${advisory.title}</strong><span>${advisory.desc}</span>`;
      vehicleTipBox.style.display = 'block';

      summaryVehicleType.textContent = selectedType;
    } else {
      vehicleTipBox.innerHTML = '';
      vehicleTipBox.style.display = 'none';
      summaryVehicleType.textContent = 'None Selected';
    }

    if (selectedType !== '') {
      clearFieldError(vehicleTypeSelect, errors.vehicleType);
    }
  }


  // ============================================================================
  // FUNCTION 3: REAL-TIME SERVICE COST CALCULATOR (calculateServiceCost)
  // ============================================================================
  /**
   * --- DEMO EXPLANATION: REAL-TIME COST CALCULATION & DIGIT 6 REQUIREMENT ---
   * Triggered on the onchange event of any service checkbox.
   * 1. Checks if 'Full Service' is selected.
   * 2. Checks if 'Computer Diagnosis' is selected.
   * 3. DIGIT 6 INDIVIDUALIZATION:
   *    If BOTH 'Full Service' and 'Computer Diagnosis' are checked,
   *    Computer Diagnosis cost is waived to KSh 0.
   *    The promo banner is displayed, and the inline price tag reflects the offer.
   * 4. Sums the total for all checked services.
   * 5. Formats the total as currency (KSh X,XXX.00) and writes to #totalCostDisplay.
   * 6. Calls updateSelectedServicesList() to sync the live breakdown list.
   */
  function calculateServiceCost() {
    let total = 0;

    const fullServiceCb = document.getElementById('svc_full');
    const diagnosisCb   = document.getElementById('svc_diagnosis');

    const hasFullService = fullServiceCb ? fullServiceCb.checked : false;
    const hasDiagnosis   = diagnosisCb ? diagnosisCb.checked : false;

    // Digit 6 rule: Computer Diagnosis is free if Full Service is selected
    const isDiagnosisFree = hasFullService && hasDiagnosis;

    // Toggle the Digit 6 offer callout and price tag
    if (isDiagnosisFree) {
      digit6PromoBanner.classList.add('active');
      if (diagnosisPriceTag) {
        diagnosisPriceTag.innerHTML = '<span class="discount-strike">KSh 3,500</span> <span class="discount-tag">FREE (Digit 6)</span>';
      }
    } else {
      digit6PromoBanner.classList.remove('active');
      if (diagnosisPriceTag) {
        diagnosisPriceTag.textContent = 'KSh 3,500';
      }
    }

    // Calculate total from checked boxes
    serviceCheckboxes.forEach(cb => {
      const parentRow = cb.closest('.service-item-row');
      if (parentRow) {
        if (cb.checked) {
          parentRow.classList.add('selected');
        } else {
          parentRow.classList.remove('selected');
        }
      }

      if (cb.checked) {
        const serviceName = cb.value;
        let itemCost = SERVICE_PRICES[serviceName] || 0;

        // Apply Digit 6 waiver
        if (serviceName === 'Computer Diagnosis' && isDiagnosisFree) {
          itemCost = 0;
        }

        total += itemCost;
      }
    });

    // Update displayed total with 2 decimal places and thousands separator
    totalCostDisplay.textContent = 'KSh ' + total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Clear service selection error if at least one checkbox is now ticked
    if (Array.from(serviceCheckboxes).some(cb => cb.checked)) {
      errors.services.textContent = '';
    }

    // Refresh dynamic bulleted list
    updateSelectedServicesList(isDiagnosisFree);
  }


  // ============================================================================
  // FUNCTION 4: DYNAMIC BULLETED SERVICES LIST (updateSelectedServicesList) - Dynamic Feature 2
  // ============================================================================
  /**
   * --- DEMO EXPLANATION: DYNAMIC DOM UPDATES (BULLETED LIST) ---
   * Called whenever calculateServiceCost() runs.
   * Clears #selectedServicesList and dynamically generates <li> items
   * for each currently checked service showing its individual price.
   */
  function updateSelectedServicesList(isDiagnosisFree) {
    selectedServicesList.innerHTML = '';

    const checkedBoxes = Array.from(serviceCheckboxes).filter(cb => cb.checked);

    if (checkedBoxes.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty-services-note';
      emptyItem.textContent = 'No services selected yet.';
      selectedServicesList.appendChild(emptyItem);
      return;
    }

    checkedBoxes.forEach(cb => {
      const serviceName = cb.value;
      let price = SERVICE_PRICES[serviceName] || 0;
      let isFree = false;

      if (serviceName === 'Computer Diagnosis' && isDiagnosisFree) {
        price = 0;
        isFree = true;
      }

      const li = document.createElement('li');
      if (isFree) {
        li.className = 'free-item';
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = isFree ? `${serviceName} (Digit 6 Offer)` : serviceName;

      const priceSpan = document.createElement('span');
      priceSpan.className = 'service-price-text';
      priceSpan.textContent = isFree ? 'KSh 0.00 (Free)' : 'KSh ' + price.toLocaleString('en-US');

      li.appendChild(nameSpan);
      li.appendChild(priceSpan);
      selectedServicesList.appendChild(li);
    });
  }


  // ============================================================================
  // EVENT LISTENERS: onsubmit, onchange, oninput, reset
  // ============================================================================

  // 1. onsubmit event on form
  bookingForm.addEventListener('submit', function (event) {
    validateServiceForm(event);
  });

  // 2. onchange event on vehicle type select
  vehicleTypeSelect.addEventListener('change', updateVehicleInfo);

  // 3. onchange event on service checkboxes
  serviceCheckboxes.forEach(cb => {
    cb.addEventListener('change', calculateServiceCost);
  });

  // 4. oninput events for instant error removal as user types
  customerNameInput.addEventListener('input', function () {
    if (this.value.trim().length >= 2) clearFieldError(customerNameInput, errors.customerName);
  });

  phoneNumberInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, ''); // Keep only numeric digits
    if (/^[0-9]{10}$/.test(this.value.trim())) clearFieldError(phoneNumberInput, errors.phoneNumber);
  });

  emailAddressInput.addEventListener('input', function () {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.trim())) clearFieldError(emailAddressInput, errors.emailAddress);
  });

  vehicleRegInput.addEventListener('input', function () {
    if (this.value.trim().length > 0) clearFieldError(vehicleRegInput, errors.vehicleReg);
  });

  manufactureYearInput.addEventListener('input', function () {
    const y = parseInt(this.value, 10);
    if (!isNaN(y) && y >= 1990 && y <= 2026) clearFieldError(manufactureYearInput, errors.manufactureYear);
  });

  serviceDateInput.addEventListener('change', function () {
    if (this.value !== '') clearFieldError(serviceDateInput, errors.serviceDate);
  });

  // 5. Form reset handler
  bookingForm.addEventListener('reset', function () {
    setTimeout(function () {
      updateVehicleInfo();
      calculateServiceCost();
      Object.keys(errors).forEach(key => {
        if (errors[key]) errors[key].textContent = '';
      });
      document.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
      });
      document.querySelectorAll('.service-item-row').forEach(row => {
        row.classList.remove('selected');
      });
    }, 0);
  });

  // Set minimum date for preferred service date to today
  const today = new Date().toISOString().split('T')[0];
  if (serviceDateInput) {
    serviceDateInput.min = today;
  }

  // Initial calculation
  calculateServiceCost();
});
