<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Provisional Purchase Order – {{ $project->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f4f4;
            padding: 40px 0;
        }
        .main {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header {
            background-color: #1a1a2e;
            padding: 32px 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .header p {
            color: #a8b3c8;
            font-size: 14px;
            margin: 8px 0 0;
        }
        .body {
            padding: 36px 40px;
        }
        .greeting {
            font-size: 16px;
            color: #333333;
            margin-bottom: 16px;
        }
        .intro {
            font-size: 15px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .details-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px 24px;
            margin-bottom: 24px;
        }
        .details-box h2 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            margin: 0 0 16px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        .detail-label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            width: 140px;
            flex-shrink: 0;
        }
        .detail-value {
            font-size: 14px;
            color: #555555;
        }
        .attachment-note {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 14px 18px;
            border-radius: 0 6px 6px 0;
            font-size: 14px;
            color: #1e40af;
            margin-bottom: 28px;
            line-height: 1.5;
        }
        .closing {
            font-size: 15px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .signature {
            font-size: 14px;
            color: #374151;
        }
        .signature strong {
            display: block;
            color: #111827;
            font-size: 15px;
        }
        .footer {
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px 40px;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">

            <div class="header">
                <h1>Provisional Purchase Order</h1>
                <p>{{ config('app.name') }}</p>
            </div>

            <div class="body">

                <p class="greeting">Dear {{ $project->client?->company_name ?? 'Valued Client' }},</p>

                <p class="intro">
                    We are pleased to inform you that a <strong>Provisional Purchase Order</strong> has been
                    raised for your project. Please find the details below and the PO document attached to
                    this email for your reference.
                </p>

                <div class="details-box">
                    <h2>PO Details</h2>

                    <div class="detail-row">
                        <span class="detail-label">Project:</span>
                        <span class="detail-value">{{ $project->name }}</span>
                    </div>

                    @if ($project->po_number)
                    <div class="detail-row">
                        <span class="detail-label">PO Number:</span>
                        <span class="detail-value">{{ $project->po_number }}</span>
                    </div>
                    @endif

                    @if ($project->deadline)
                    <div class="detail-row">
                        <span class="detail-label">Project Deadline:</span>
                        <span class="detail-value">{{ $project->deadline->format('d M Y') }}</span>
                    </div>
                    @endif

                    @if ($project->description)
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">{{ $project->description }}</span>
                    </div>
                    @endif
                </div>

                @if ($project->po_document)
                <div class="attachment-note">
                    📎 The Provisional PO document is attached to this email. Please review and retain it for
                    your records.
                </div>
                @endif

                <p class="closing">
                    If you have any questions or require further clarification regarding this purchase order,
                    please do not hesitate to contact your account manager directly.
                </p>

                <div class="signature">
                    Kind regards,<br>
                    <strong>{{ config('app.name') }} Team</strong>
                </div>

            </div>

            <div class="footer">
                <p>
                    This is an automated notification from {{ config('app.name') }}.<br>
                    Please do not reply directly to this email.
                </p>
            </div>

        </div>
    </div>
</body>
</html>
