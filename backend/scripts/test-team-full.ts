
import { config } from '../src/config/env';

const BASE_URL = `http://localhost:${config.port}${config.apiPrefix}`;
const ADMIN_EMAIL = 'admin@ibistek.com';
const ADMIN_PASSWORD = 'password123';

async function testTeamFeature() {
  console.log('🚀 Starting Team Feature Full Test...');
  console.log(`📡 Connecting to: ${BASE_URL}`);

  let token = '';
  let memberId = '';

  // 1. Login to get Token
  try {
    console.log('\n🔐 Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(`Login failed: ${JSON.stringify(err)}`);
    }

    const loginData = await loginRes.json();
    token = loginData.data.accessToken; // Check if structure matches auth response
    console.log('✅ Login successful! Token received.');
  } catch (error) {
    console.error('❌ Login Step Failed:', error);
    process.exit(1);
  }

  // 2. Create Team Member
  try {
    console.log('\nbust👤 Creating new Team Member...');
    const createRes = await fetch(`${BASE_URL}/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Member Bot',
        type: 'STAFF',
        division: 'Bot Division',
        image: 'https://placehold.co/400', // Dummy image
        bio: 'I am a test bot.',
        email: 'bot@test.com',
        isActive: true,
      }),
    });

    if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(`Create failed: ${JSON.stringify(err)}`);
    }

    const createData = await createRes.json();
    memberId = createData.data.id;
    console.log('✅ Team Member created! ID:', memberId);
  } catch (error) {
    console.error('❌ Create Step Failed:', error);
    process.exit(1);
  }

  // 3. Update Team Member
  try {
    console.log(`\n✏️ Updating Team Member (${memberId})...`);
    const updateRes = await fetch(`${BASE_URL}/team/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Member Bot Updated',
        title: 'Senior Bot',
      }),
    });

    if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(`Update failed: ${JSON.stringify(err)}`);
    }

    const updateData = await updateRes.json();
    if (updateData.data.name !== 'Test Member Bot Updated') {
        throw new Error('Update verification failed: Name did not change.');
    }
    console.log('✅ Team Member updated successfully!');
  } catch (error) {
    console.error('❌ Update Step Failed:', error);
    process.exit(1);
  }

  // 4. Get Team Member details
  try {
    console.log(`\n🔍 Fetching Team Member details...`);
    const getRes = await fetch(`${BASE_URL}/team/${memberId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getRes.ok) {
       throw new Error(`Get failed: ${getRes.statusText}`);
    }
    const getData = await getRes.json();
    console.log('✅ Team Member fetched:', getData.data.name);
  } catch (error) {
    console.error('❌ Get Step Failed:', error);
    process.exit(1);
  }

  // 5. Delete Team Member
  try {
    console.log(`\n🗑️ Deleting Team Member (${memberId})...`);
    const deleteRes = await fetch(`${BASE_URL}/team/${memberId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!deleteRes.ok) {
        const err = await deleteRes.json();
        throw new Error(`Delete failed: ${JSON.stringify(err)}`);
    }

    console.log('✅ Team Member deleted successfully!');
  } catch (error) {
    console.error('❌ Delete Step Failed:', error);
    process.exit(1);
  }

  console.log('\n🎉 All Team Feature Tests Passed!');
}

testTeamFeature();
