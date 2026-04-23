<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderOverrideTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->user, 'sanctum');
    }

    public function test_override_updates_reminder_fields_and_creates_audit_log(): void
    {
        $reminder = Reminder::factory()->create([
            'user_id'    => $this->user->id,
            'reminder_at'=> now()->addDay(),
        ]);

        $newDate = now()->addDays(5)->toDateTimeString();

        $response = $this->patchJson("/api/reminders/{$reminder->id}/override", [
            'reminder_at'             => $newDate,
            'reminder_frequency_days' => 7,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['is_overridden' => true])
            ->assertJsonFragment(['overridden_by' => $this->user->id]);

        $this->assertDatabaseHas('reminders', [
            'id'                      => $reminder->id,
            'is_overridden'           => true,
            'overridden_by'           => $this->user->id,
            'reminder_frequency_days' => 7,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'entity_id'    => $reminder->id,
            'action'       => 'reminder_override',
            'field_changed'=> 'reminder_at',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'entity_id'    => $reminder->id,
            'action'       => 'reminder_override',
            'field_changed'=> 'reminder_frequency_days',
        ]);
    }

    public function test_override_with_only_reminder_at(): void
    {
        $reminder = Reminder::factory()->create(['user_id' => $this->user->id]);
        $newDate = now()->addDays(3)->toDateTimeString();

        $response = $this->patchJson("/api/reminders/{$reminder->id}/override", [
            'reminder_at' => $newDate,
        ]);

        $response->assertStatus(200)->assertJsonFragment(['is_overridden' => true]);

        $this->assertEquals(1, AuditLog::where('entity_id', $reminder->id)
            ->where('field_changed', 'reminder_at')->count());
    }

    public function test_revert_clears_override_fields(): void
    {
        $reminder = Reminder::factory()->create([
            'user_id'                 => $this->user->id,
            'is_overridden'           => true,
            'overridden_by'           => $this->user->id,
            'overridden_at'           => now(),
            'reminder_frequency_days' => 7,
        ]);

        $response = $this->deleteJson("/api/reminders/{$reminder->id}/override");

        $response->assertStatus(200)
            ->assertJsonFragment(['is_overridden' => false]);

        $this->assertDatabaseHas('reminders', [
            'id'                      => $reminder->id,
            'is_overridden'           => false,
            'overridden_by'           => null,
            'overridden_at'           => null,
            'reminder_frequency_days' => null,
        ]);
    }

    public function test_revert_creates_audit_log(): void
    {
        $reminder = Reminder::factory()->create([
            'user_id'       => $this->user->id,
            'is_overridden' => true,
            'overridden_by' => $this->user->id,
            'overridden_at' => now(),
        ]);

        $this->deleteJson("/api/reminders/{$reminder->id}/override");

        $this->assertDatabaseHas('audit_logs', [
            'entity_id'    => $reminder->id,
            'action'       => 'reminder_override',
            'field_changed'=> 'is_overridden',
        ]);
    }

    public function test_audit_log_has_correct_entries(): void
    {
        $reminder = Reminder::factory()->create(['user_id' => $this->user->id]);
        $oldDate = $reminder->reminder_at->toDateTimeString();
        $newDate = now()->addDays(10)->toDateTimeString();

        $this->patchJson("/api/reminders/{$reminder->id}/override", [
            'reminder_at' => $newDate,
        ]);

        $log = AuditLog::where('entity_id', $reminder->id)
            ->where('field_changed', 'reminder_at')
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals($this->user->id, $log->user_id);
        $this->assertEquals('reminder_override', $log->action);
    }

    public function test_override_validation_requires_date_for_reminder_at(): void
    {
        $reminder = Reminder::factory()->create(['user_id' => $this->user->id]);

        $response = $this->patchJson("/api/reminders/{$reminder->id}/override", [
            'reminder_at' => 'not-a-date',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['reminder_at']);
    }
}
