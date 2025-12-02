<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            ['description' => 'Digital department']
        );

        $designDept = Department::firstOrCreate(
            ['name' => 'Design'],
            ['description' => 'Design department']
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

        $this->command->info('Test users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Team Lead: teamlead@example.com / password');
        $this->command->info('User: user@example.com / password');
    }
}
