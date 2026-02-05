<?php

namespace App\Console\Commands;

//illuminate log
use Vluzrmos\SlackApi\Contracts\SlackApi;
use SlackUser;
use SlackChat;
use SlackChannel;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;

class SlackMigrateMattermost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:smm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
		$slack = app(SlackApi::class);

		$channel = $slack->load('Channel');

		// First, list all available channels
		$this->info('Fetching available channels...');
		$this->line('');
		
		$channelsList = $channel->lists();
		
		if (isset($channelsList->ok) && $channelsList->ok) {
			$this->info('Available Channels:');
			$this->line('==================');
			
			if (isset($channelsList->channels) && is_array($channelsList->channels)) {
				foreach ($channelsList->channels as $ch) {
					$this->line('ID: ' . ($ch->id ?? 'N/A'));
					$this->line('Name: ' . ($ch->name ?? 'N/A'));
					$this->line('Is Member: ' . (($ch->is_member ?? false) ? 'Yes' : 'No'));
					$this->line('---');
				}
			}
		} else {
			$this->error('Failed to fetch channels');
			$this->line('Response: ' . json_encode($channelsList, JSON_PRETTY_PRINT));
		}
		
		$this->line('');
		$this->line('Now trying to fetch history for C09NTG1CPQR...');
		$this->line('');

		$cc = $channel->history('C09NTG1CPQR');

		$this->info('Channel History:');
		$this->line('================');
		
		if (isset($cc->ok) && $cc->ok && isset($cc->messages) && is_array($cc->messages)) {
			$this->info('Total messages: ' . count($cc->messages));
			$this->line('');
			
			foreach ($cc->messages as $index => $message) {
				$this->line('Message #' . ($index + 1));
				$this->line('User: ' . ($message->user ?? 'Unknown'));
				$this->line('Text: ' . ($message->text ?? 'No text'));
				$this->line('Timestamp: ' . ($message->ts ?? 'Unknown'));
				$this->line('---');
			}
		} else {
			$this->error('No messages found or invalid response');
			$this->line('Error: ' . ($cc->error ?? 'Unknown error'));
			$this->line('Full response:');
			$this->line(json_encode($cc, JSON_PRETTY_PRINT));
		}
		
		Log::info('Channel: ' . json_encode($cc));
    }
}
