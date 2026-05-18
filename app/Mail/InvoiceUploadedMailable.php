<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceUploadedMailable extends Mailable
{
    use Queueable, SerializesModels;

    public Project $project;

    /**
     * Create a new message instance.
     */
    public function __construct(Project $project)
    {
        $this->project = $project;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invoice Uploaded for Project: {$this->project->name}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-uploaded',
            with: [
                'projectName' => $this->project->name,
                'invoiceNumber' => $this->project->invoice_number,
                'isPhysical' => $this->project->is_physical_invoice,
                'trackingNumber' => $this->project->courier_tracking_number,
                'clientName' => $this->project->client?->name,
            ],
        );
    }
}
