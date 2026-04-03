<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
        }
        .info-box {
            background-color: white;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #4F46E5;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Invoice Uploaded</h1>
    </div>
    <div class="content">
        <p>Hello,</p>

        <p>An invoice has been uploaded for the following project:</p>

        <div class="info-box">
            <p><span class="label">Project:</span> {{ $projectName }}</p>
            @if($clientName)
            <p><span class="label">Client:</span> {{ $clientName }}</p>
            @endif
            <p><span class="label">Invoice Number:</span> {{ $invoiceNumber }}</p>
            <p><span class="label">Delivery Method:</span> {{ $isPhysical ? 'Physical Invoice' : 'Digital Invoice' }}</p>
            @if($isPhysical && $trackingNumber)
            <p><span class="label">Tracking Number:</span> {{ $trackingNumber }}</p>
            @endif
        </div>

        @if($isPhysical)
        <p>This is a physical invoice that will be delivered via courier. You can track the delivery status using the tracking number provided.</p>
        @else
        <p>This is a digital invoice. You can download it from the project dashboard.</p>
        @endif

        <p>Thank you!</p>
    </div>
</body>
</html>
