<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetAllPasswords extends Command
{
    /**
     * The name and signature of the console command.
     * php artisan users:reset-passwords
     * @var string
     */
    protected $signature = 'users:reset-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset all user passwords to a default value with a progress bar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $password = 'admin@1234';
        $hashedPassword = Hash::make($password);
        
        $count = User::count();
        
        $this->info("Target password: {$password}");

        if (!$this->confirm("This will reset passwords for {$count} users. Are you sure you want to proceed?", false)) {
            $this->error('Operation cancelled.');
            return;
        }

        $this->info('Resetting passwords...');

        $this->withProgressBar(User::all(), function ($user) use ($hashedPassword) {
            $user->update([
                'password' => $hashedPassword,
                'force_password_reset' => false
            ]);
        });

        $this->newLine();
        $this->info("Successfully reset passwords for {$count} users.");
    }
}
