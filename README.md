# Online Vehicle Service Booking & Cost Estimation System
**Course:** Web Development & Applications (PHP & JavaScript CAT 1)  
**Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), PHP Backend  

---

## Overview
This application is a clean, accessible web system for vehicle service booking and cost estimation. It provides:
1. Client-side input validation without intrusive popups.
2. Real-time cost calculation as service checkboxes are toggled.
3. Dynamic DOM updates for vehicle-specific maintenance advice and live service lists.
4. Digit 6 bundle discount: **Computer Diagnosis is FREE (KSh 0)** when **Full Service** is selected.
5. Independent server-side recalculation and validation in PHP with official receipt generation.

---

## File Structure
- `index.html` — System overview and service rate catalog.
- `service.html` — Interactive booking form and live cost estimation panel.
- `process_service.php` — Server-side POST processor, independent pricing re-evaluator, and receipt generator.
- `css/style.css` — Clean, grounded stylesheet with zero AI slop (no floating transforms, no neon glow orbs, no pulsing radar dots).
- `js/script.js` — Form validation, real-time calculations, dynamic DOM updates, and Digit 6 discount logic.

---

## How to Run

1. Open PowerShell / Terminal in this project directory:
   ```bash
   cd "C:\Users\SHARON\Desktop\web2 cat1"
   ```

2. Start PHP's built-in server:
   ```bash
   php -S localhost:8000
   ```

3. Open your browser:
   - Home: `http://localhost:8000/index.html`
   - Booking: `http://localhost:8000/service.html`

---

## Assignment Implementation Reference

- **Validation:** [`js/script.js`](file:///C:/Users/SHARON/Desktop/web2%20cat1/js/script.js#L95-L185) (`validateServiceForm`).
- **Dynamic Vehicle Tip:** [`js/script.js`](file:///C:/Users/SHARON/Desktop/web2%20cat1/js/script.js#L190-L220) (`updateVehicleInfo`).
- **Dynamic Bulleted List:** [`js/script.js`](file:///C:/Users/SHARON/Desktop/web2%20cat1/js/script.js#L295-L345) (`updateSelectedServicesList`).
- **Real-Time Cost Calculator & Digit 6:** [`js/script.js`](file:///C:/Users/SHARON/Desktop/web2%20cat1/js/script.js#L230-L290) (`calculateServiceCost`).
- **PHP POST Recalculation & Receipt:** [`process_service.php`](file:///C:/Users/SHARON/Desktop/web2%20cat1/process_service.php#L30-L160).
