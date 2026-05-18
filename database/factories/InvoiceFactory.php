<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'source'         => $this->faker->randomElement(['manual', 'xero']),
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('####'),
            'status'         => $this->faker->randomElement(['pending', 'paid', 'overdue']),
            'amount'         => $this->faker->randomFloat(2, 100, 10000),
            'currency'       => 'USD',
            'issued_at'      => now(),
            'due_date'       => now()->addDays(30),
        ];
    }
}
