import { test, expect } from '@playwright/test';

test.describe('API E2E Tests', () => {

  test('Public Endpoints Availability', async ({ request }) => {
    // 1. Health Check
    const health = await request.get('/health');
    expect(health.ok()).toBeTruthy();
    const healthJson = await health.json();
    expect(healthJson.status).toBe('ok');

    // 2. Events (Public)
    const events = await request.get('/api/v1/events');
    expect(events.ok()).toBeTruthy();
    const eventsJson = await events.json();
    expect(eventsJson.data.data.length).toBeGreaterThan(0);
    // Check seeded event
    const seededEvent = eventsJson.data.data.find((e: any) => e.slug === 'workshop-digital-2026');
    expect(seededEvent).toBeDefined();

    // 3. Programs (Public)
    const programs = await request.get('/api/v1/programs');
    expect(programs.ok()).toBeTruthy();
    const programsJson = await programs.json();
    expect(programsJson.data.length).toBeGreaterThan(0);
    // Check seeded program
    const seededProgram = programsJson.data.find((p: any) => p.slug === 'inkubasi-bisnis');
    expect(seededProgram).toBeDefined();

    // 4. Team (Public)
    const team = await request.get('/api/v1/team');
    expect(team.ok()).toBeTruthy();
    const teamJson = await team.json();
    expect(teamJson.data.length).toBeGreaterThan(0);
    // Check seeded team member
    const seededMember = teamJson.data.find((m: any) => m.name === 'Dr. Budi Santoso');
    expect(seededMember).toBeDefined();

    // 5. Updates (Public)
    const updates = await request.get('/api/v1/updates');
    expect(updates.ok()).toBeTruthy();
    const updatesJson = await updates.json();
    expect(updatesJson.data.data.length).toBeGreaterThan(0);
    // Check seeded update
    const seededUpdate = updatesJson.data.data.find((u: any) => u.slug === 'pembukaan-batch-2026');
    expect(seededUpdate).toBeDefined();
  });

  test('Authentication Flow', async ({ request }) => {
    // 1. Login as Member
    const loginRes = await request.post('/api/v1/auth/login', {
      data: {
        email: 'member@ibistek.com',
        password: 'password123'
      }
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    expect(loginData.data.token).toBeDefined();
    
    const token = loginData.data.token;

    // 2. Access Protected Route (Me)
    const meRes = await request.get('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    expect(meRes.ok()).toBeTruthy();
    const meData = await meRes.json();
    expect(meData.data.email).toBe('member@ibistek.com');
  });

  test('RBAC Enforcement', async ({ request }) => {
    // 1. Login as Member (has fewer permissions)
    const memberLogin = await request.post('/api/v1/auth/login', {
      data: { email: 'member@ibistek.com', password: 'password123' }
    });
    const memberToken = (await memberLogin.json()).data.token;

    // 2. Try to Create Event (Should Fail)
    const createEventRes = await request.post('/api/v1/events', {
      headers: { Authorization: `Bearer ${memberToken}` },
      data: {
        title: 'Unauthorized Event',
        slug: 'unauthorized-event',
        description: 'Should fail',
        date: new Date().toISOString(),
      }
    });
    expect(createEventRes.status()).toBe(403); // Forbidden

    // 3. Login as Admin
    const adminLogin = await request.post('/api/v1/auth/login', {
      data: { email: 'admin@ibistek.com', password: 'password123' }
    });
    const adminToken = (await adminLogin.json()).data.token;

    // 4. Create Event as Admin (Should Succeed)
    // Use unique slug to ensure test repeatability/cleanup handling isn't strictly needed for this simple flow
    const uniqueSlug = `admin-event-${Date.now()}`;
    const adminCreateRes = await request.post('/api/v1/events', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Admin Created Event',
        slug: uniqueSlug,
        description: 'Authorized event creation',
        date: new Date().toISOString(),
        status: 'UPCOMING',
        category: 'general'
      }
    });
    expect(adminCreateRes.status()).toBe(201);
    
    // 5. Delete Event as Admin
    const createdEventId = (await adminCreateRes.json()).data.id;
    const deleteRes = await request.delete(`/api/v1/events/${createdEventId}`, {
         headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(deleteRes.status()).toBe(200);
  });

  test('User Management (Admin)', async ({ request }) => {
    // Helper login
    const login = async (email: string, pass: string) => {
        const res = await request.post('/api/v1/auth/login', {
            data: { email, password: pass }
        });
        return (await res.json()).data.token;
    };

    // 1. Unauthorized Access (Public/Member)
    const publicRes = await request.get('/api/v1/users');
    expect(publicRes.status()).toBe(401);

    const memberToken = await login('member@ibistek.com', 'password123');
    const memberRes = await request.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(memberRes.status()).toBe(403);

    // 2. Admin Access (Create, List, Update, Delete)
    const adminToken = await login('admin@ibistek.com', 'password123');
    
    // Create User
    const newUserEmail = `testuser-${Date.now()}@ibistek.com`;
    const createRes = await request.post('/api/v1/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        email: newUserEmail,
        password: 'password123',
        name: 'Test User',
        role: 'MEMBER',
        isActive: true,
      }
    });

    expect(createRes.status()).toBe(201);
    const createdUser = (await createRes.json()).data;
    expect(createdUser.email).toBe(newUserEmail);

    // List Users
    const listRes = await request.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(listRes.status()).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.data.length).toBeGreaterThan(0);
    const foundUser = listJson.data.data.find((u: any) => u.email === newUserEmail);
    expect(foundUser).toBeDefined();

    // Update User
    const updateRes = await request.put(`/api/v1/users/${createdUser.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'Updated Test User',
      }
    });
    expect(updateRes.status()).toBe(200);
    const updatedUser = (await updateRes.json()).data;
    expect(updatedUser.name).toBe('Updated Test User');

    // Delete User
    const deleteRes = await request.delete(`/api/v1/users/${createdUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteRes.status()).toBe(200);

    // Verify Deletion
    const verifyRes = await request.delete(`/api/v1/users/${createdUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(verifyRes.status()).toBe(404); // Should be not found now
  });
});
