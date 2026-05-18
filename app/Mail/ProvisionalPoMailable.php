<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProvisionalPoMailable extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Project $project,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Provisional Purchase Order – ' . $this->project->name,
            cc: $this->getAccountManagerAddresses(),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.provisional-po',
            with: [
                'project' => $this->project,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if (! $this->project->po_document) {
            return [];
        }

        try {
            $fileContent = Storage::disk('s3')->get($this->project->po_document);
            $filename    = 'provisional_po_' . $this->project->id . '.pdf';

            return [
                \Illuminate\Mail\Mailables\Attachment::fromData(
                    fn () => $fileContent,
                    $filename
                )->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            Log::error('ProvisionalPoMailable: failed to attach PO document.', [
                'project_id' => $this->project->id,
                'error'      => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Return CC addresses for all account-manager collaborators on this project.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Address>
     */
    protected function getAccountManagerAddresses(): array
    {
        $addresses = [];

        // Filter on the already-loaded collaborators collection (avoids an extra query)
        $accountManagers = $this->project->collaborators->filter(
            fn ($user) => $user->role === 'account-manager'
        );

        foreach ($accountManagers as $manager) {
            if ($manager->email) {
                $addresses[] = new \Illuminate\Mail\Mailables\Address($manager->email, $manager->name);
            }
        }

        return $addresses;
    }
}
