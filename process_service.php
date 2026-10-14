<?php
/**
 * Vehicle Service Booking & Cost Estimation System
 * Course: Web Development & Applications (PHP/JS)
 * File: process_service.php
 * Description: Server-side validation, independent price recalculation,
 *              Digit 6 bundle logic, and official booking receipt generation.
 */

// --- DEMO EXPLANATION: POST METHOD VERIFICATION ---
// Direct GET access to this processing script is blocked.
// Users must submit through service.html.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: service.html');
    exit('Direct access not permitted. Please submit via the booking form.');
}

// ==============================================================================
// 1. DATA EXTRACTION & INPUT SANITIZATION
// ==============================================================================
// --- DEMO EXPLANATION: SANITIZATION ---
// Trim whitespace and use htmlspecialchars() to neutralize XSS characters.
$rawName        = isset($_POST['customer_name']) ? trim($_POST['customer_name']) : '';
$rawPhone       = isset($_POST['phone_number']) ? trim($_POST['phone_number']) : '';
$rawEmail       = isset($_POST['email_address']) ? trim($_POST['email_address']) : '';
$rawVehicleReg  = isset($_POST['vehicle_reg']) ? trim($_POST['vehicle_reg']) : '';
$rawVehicleType = isset($_POST['vehicle_type']) ? trim($_POST['vehicle_type']) : '';
$rawYear        = isset($_POST['manufacture_year']) ? trim($_POST['manufacture_year']) : '';
$rawDate        = isset($_POST['service_date']) ? trim($_POST['service_date']) : '';
$rawServices    = isset($_POST['services']) && is_array($_POST['services']) ? $_POST['services'] : [];

$customerName    = htmlspecialchars($rawName, ENT_QUOTES, 'UTF-8');
$phoneNumber     = htmlspecialchars($rawPhone, ENT_QUOTES, 'UTF-8');
$emailAddress    = htmlspecialchars($rawEmail, ENT_QUOTES, 'UTF-8');
$vehicleReg      = strtoupper(htmlspecialchars($rawVehicleReg, ENT_QUOTES, 'UTF-8'));
$vehicleType     = htmlspecialchars($rawVehicleType, ENT_QUOTES, 'UTF-8');
$manufactureYear = intval($rawYear);
$serviceDate     = htmlspecialchars($rawDate, ENT_QUOTES, 'UTF-8');

// ==============================================================================
// 2. SERVER-SIDE VALIDATION
// ==============================================================================
// --- DEMO EXPLANATION: SERVER-SIDE VALIDATION ---
// Never rely solely on client-side JS validation.
// The backend verifies all mandatory constraints independently.
$validationErrors = [];

if (empty($rawName) || strlen($rawName) < 2) {
    $validationErrors[] = "Full name is required and must be at least 2 characters.";
}

if (empty($rawPhone) || !preg_match('/^[0-9]{10}$/', $rawPhone)) {
    $validationErrors[] = "Phone number must be exactly 10 numeric digits (e.g. 0712345678).";
}

if (empty($rawEmail) || !filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
    $validationErrors[] = "A valid email address is required.";
}

if (empty($rawVehicleReg)) {
    $validationErrors[] = "Vehicle registration number is required.";
}

$validTypes = ['Saloon Car', 'SUV', 'Pickup', 'Van'];
if (empty($rawVehicleType) || !in_array($rawVehicleType, $validTypes, true)) {
    $validationErrors[] = "Please select a valid vehicle type.";
}

if (empty($rawYear) || !is_numeric($rawYear) || $manufactureYear < 1990 || $manufactureYear > 2026) {
    $validationErrors[] = "Year of manufacture must be between 1990 and 2026.";
}

if (empty($rawDate)) {
    $validationErrors[] = "Preferred service date is required.";
}

if (empty($rawServices)) {
    $validationErrors[] = "At least one service must be selected.";
}

// ==============================================================================
// 3. MASTER SERVICE CATALOG & INDEPENDENT RECALCULATION
// ==============================================================================
// --- DEMO EXPLANATION: INDEPENDENT COST CALCULATION ---
// Client-side totals are deliberately ignored.
// PHP maps selected service names against the authoritative master price catalog.
$MASTER_PRICES = [
    'Engine Oil Change'   => 3000,
    'Brake Inspection'    => 2000,
    'Wheel Alignment'     => 2500,
    'Computer Diagnosis'  => 3500,
    'Full Service'        => 8000
];

$validSelectedServices = [];
foreach ($rawServices as $svc) {
    $cleanSvc = trim($svc);
    if (array_key_exists($cleanSvc, $MASTER_PRICES)) {
        $validSelectedServices[] = $cleanSvc;
    }
}

if (empty($validSelectedServices) && empty($validationErrors)) {
    $validationErrors[] = "None of the selected services match our catalog.";
}

// ==============================================================================
// 4. DIGIT 6 INDIVIDUALIZATION REQUIREMENT (SERVER-SIDE EVALUATION)
// ==============================================================================
// --- DEMO EXPLANATION: DIGIT 6 LOGIC IN PHP ---
// Rule: Free Computer Diagnosis (KSh 0) IF Full Service is also selected.
$hasFullService = in_array('Full Service', $validSelectedServices, true);
$hasDiagnosis   = in_array('Computer Diagnosis', $validSelectedServices, true);
$isDigit6OfferActive = ($hasFullService && $hasDiagnosis);

$grossSubtotal = 0;
$discountTotal = 0;
$verifiedTotal = 0;
$serviceItems  = [];

foreach ($validSelectedServices as $svcName) {
    $basePrice = $MASTER_PRICES[$svcName];
    $grossSubtotal += $basePrice;

    if ($svcName === 'Computer Diagnosis' && $isDigit6OfferActive) {
        $discount = 3500;
        $netCost  = 0;
        $discountTotal += $discount;
        $statusNote = 'Digit 6 Free (Full Service Bundle)';
        $isFree = true;
    } else {
        $discount = 0;
        $netCost  = $basePrice;
        $statusNote = 'Standard Rate';
        $isFree = false;
    }

    $verifiedTotal += $netCost;

    $serviceItems[] = [
        'name'        => $svcName,
        'base_price'  => $basePrice,
        'discount'    => $discount,
        'net_cost'    => $netCost,
        'status'      => $statusNote,
        'is_free'     => $isFree
    ];
}

$bookingReference = 'AP-' . date('Y') . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
$receiptTimestamp = date('d M Y, h:i A');

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Booking Receipt - AutoPro Mechanics</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Navigation Bar -->
  <header class="navbar">
    <div class="nav-container">
      <a href="index.html" class="brand-logo">AutoPro Mechanics</a>
      <nav>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="service.html">Book Service</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="main-content">

    <?php if (!empty($validationErrors)): ?>
      <!-- Server Validation Error Notice -->
      <div class="server-error-box">
        <h2>Validation Error</h2>
        <p>The form could not be processed due to the following errors:</p>
        <ul>
          <?php foreach ($validationErrors as $err): ?>
            <li><?php echo htmlspecialchars($err, ENT_QUOTES, 'UTF-8'); ?></li>
          <?php endforeach; ?>
        </ul>
        <div>
          <a href="javascript:history.back()" class="btn btn-primary">&larr; Return to Form</a>
        </div>
      </div>

    <?php else: ?>

      <!-- Official Verified Receipt -->
      <div class="receipt-wrapper">

        <div class="receipt-header">
          <div>
            <div class="receipt-title">AutoPro Mechanics Ltd.</div>
            <div class="receipt-subtitle">Automotive Engineering &amp; Service Center, Nairobi</div>
          </div>
          <div class="receipt-ref">
            <span class="receipt-ref-code"><?php echo $bookingReference; ?></span>
            <div>Date: <?php echo $receiptTimestamp; ?></div>
          </div>
        </div>

        <div class="receipt-status-bar">
          Status: Booking Confirmed &bull; Verified Server Calculation
        </div>

        <div class="receipt-body">

          <!-- Customer and Vehicle Information -->
          <div class="receipt-grid">
            <div class="receipt-col">
              <h4>Customer Information</h4>
              <table class="receipt-table-info">
                <tr>
                  <td class="label">Name:</td>
                  <td class="val"><?php echo $customerName; ?></td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td class="val"><?php echo $phoneNumber; ?></td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td class="val"><?php echo $emailAddress; ?></td>
                </tr>
                <tr>
                  <td class="label">Service Date:</td>
                  <td class="val"><?php echo htmlspecialchars($rawDate, ENT_QUOTES, 'UTF-8'); ?></td>
                </tr>
              </table>
            </div>

            <div class="receipt-col">
              <h4>Vehicle Information</h4>
              <table class="receipt-table-info">
                <tr>
                  <td class="label">Registration:</td>
                  <td class="val"><?php echo $vehicleReg; ?></td>
                </tr>
                <tr>
                  <td class="label">Vehicle Type:</td>
                  <td class="val"><?php echo $vehicleType; ?></td>
                </tr>
                <tr>
                  <td class="label">Manufacture Year:</td>
                  <td class="val"><?php echo $manufactureYear; ?></td>
                </tr>
                <tr>
                  <td class="label">Reference:</td>
                  <td class="val" style="font-family: monospace;"><?php echo $bookingReference; ?></td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Digit 6 Notification Banner (if applied) -->
          <?php if ($isDigit6OfferActive): ?>
            <div class="digit6-promo-banner active">
              <h4>Digit 6 Special Offer Applied</h4>
              <p>Full Service package selected: Computer Diagnosis fee (KSh 3,500) has been waived to <strong>KSh 0.00</strong>.</p>
            </div>
          <?php endif; ?>

          <!-- Breakdown Table -->
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-color); margin-bottom: 0.5rem;">
            Selected Services &amp; Verified Cost Breakdown
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Service Description</th>
                <th style="text-align: right;">Standard Rate</th>
                <th>Applied Offer</th>
                <th style="text-align: right;">Net Cost</th>
              </tr>
            </thead>
            <tbody>
              <?php 
              $idx = 1;
              foreach ($serviceItems as $item): 
              ?>
                <tr>
                  <td><?php echo $idx++; ?></td>
                  <td><strong><?php echo htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8'); ?></strong></td>
                  <td style="text-align: right;">KSh <?php echo number_format($item['base_price'], 2); ?></td>
                  <td>
                    <?php if ($item['is_free']): ?>
                      <span class="discount-tag">Digit 6 Free (Save KSh 3,500)</span>
                    <?php else: ?>
                      <span style="color: var(--text-muted); font-size: 0.85rem;">None</span>
                    <?php endif; ?>
                  </td>
                  <td style="text-align: right; font-weight: 600;">
                    <?php if ($item['is_free']): ?>
                      <span class="discount-strike">KSh 3,500.00</span> KSh 0.00
                    <?php else: ?>
                      KSh <?php echo number_format($item['net_cost'], 2); ?>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div class="receipt-summary-block">
            <div class="receipt-summary-line">
              <span>Catalog Subtotal:</span>
              <span>KSh <?php echo number_format($grossSubtotal, 2); ?></span>
            </div>
            <?php if ($discountTotal > 0): ?>
              <div class="receipt-summary-line" style="color: var(--success-color); font-weight: 600;">
                <span>Digit 6 Discount:</span>
                <span>- KSh <?php echo number_format($discountTotal, 2); ?></span>
              </div>
            <?php endif; ?>
            <div class="receipt-summary-line total">
              <span>Verified Total:</span>
              <span>KSh <?php echo number_format($verifiedTotal, 2); ?></span>
            </div>
          </div>

          <!-- Actions -->
          <div class="receipt-actions">
            <a href="index.html" class="btn btn-secondary">Home</a>
            <a href="service.html" class="btn btn-secondary">New Booking</a>
            <button onclick="window.print()" class="btn btn-primary">Print Receipt</button>
          </div>

        </div>
      </div>

    <?php endif; ?>

  </main>

  <footer class="site-footer">
    <div class="footer-container">
      <div>AutoPro Vehicle Service Booking &amp; Cost Estimation System</div>
      <div>PHP &amp; Web Development CAT 1 Assignment</div>
    </div>
  </footer>

</body>
</html>
