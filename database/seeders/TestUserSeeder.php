<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create departments if they don't exist
        $digitalDept = Department::firstOrCreate(
            ['name' => 'Digital'],
        );

        $designDept = Department::firstOrCreate(
            ['name' => 'Design'],
        );

        // Create test users with password 'password'
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'department_id' => $digitalDept->id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'teamlead@example.com'],
            [
                'name' => 'Team Lead',
                'password' => Hash::make('password'),
                'role' => 'team-lead',
                'department_id' => $digitalDept->id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'department_id' => $designDept->id,
            ]
        );

        // Create a sample project to trigger suggested tasks creation
        $adminUser = User::where('email', 'admin@example.com')->first();
        \App\Models\Project::firstOrCreate(
            ['name' => 'Website Redesign'],
            [
                'description' => 'Redesign the corporate website.',
                'department_id' => $digitalDept->id,
                'deadline' => now()->addMonth(),
                'created_by' => $adminUser->id,
            ]
        );

        $this->command->info('Test users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Team Lead: teamlead@example.com / password');
        $this->command->info('User: user@example.com / password');
    }
}
