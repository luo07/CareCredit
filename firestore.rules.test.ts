import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { describe, it, beforeAll, afterAll } from 'vitest';

let testEnv: any;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-carecredit-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('CareCredit Firestore Rules - The Dirty Dozen', () => {
  it('1. Rejects user creating profile for another userId', async () => {
    const unauthedDb = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(unauthedDb.collection('users').doc('bob').set({
      email: 'alice@taylors.edu.my', name: 'Alice', credits: 2.0, trustScore: 100, role: 'student', isActive: true, createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('2. Rejects user modifying role to admin directly', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
      await context.firestore().collection('users').doc('alice').set({
        email: 'alice@taylors.edu.my', name: 'Alice', credits: 2.0, trustScore: 100, role: 'student', isActive: true, createdAt: new Date(), updatedAt: new Date()
      });
    });
    await assertFails(db.collection('users').doc('alice').update({ role: 'admin' }));
  });

  it('3. Rejects user modifying credits to 1000 directly', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('users').doc('alice').update({ credits: 1000 }));
  });

  it('4. Rejects user updating status of a task they dont own to cancelled', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
      await context.firestore().collection('tasks').doc('task1').set({
        creatorId: 'bob', status: 'open', title: 'Task1', description: 'Desc', category: 'help', expectedDuration: 1, location: 'Library', createdAt: new Date(), updatedAt: new Date()
      });
    });
    await assertFails(db.collection('tasks').doc('task1').update({ status: 'cancelled' }));
  });

  it('5. Rejects user updating task status to a non-existent state like hacked', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('tasks').doc('task1').update({ status: 'hacked' }));
  });

  it('6. Rejects user creating a task with a massive 2MB description string', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    const massiveString = 'a'.repeat(2000000); // Exceeds size limits
    await assertFails(db.collection('tasks').doc('task2').set({
      type: 'request', title: 'Task', description: massiveString, category: 'help', expectedDuration: 1, location: 'Lib', status: 'open', creatorId: 'alice', createdAt: new Date(), updatedAt: new Date()
    }));
  });

  it('7. Rejects user reading messages of a task they are not involved in', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('tasks').doc('task1').collection('messages').get());
  });

  it('8. Rejects user creating a message in a task they are not involved in', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('tasks').doc('task1').collection('messages').doc('msg1').set({
      senderId: 'alice', text: 'Hi', createdAt: new Date()
    }));
  });

  it('9. Rejects user modifying an existing transaction record', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('transactions').doc('tx1').update({ amount: 999 }));
  });

  it('10. Rejects user creating feedback for a task they are not involved in', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('feedback').doc('fb1').set({
      taskId: 'task1', reviewerId: 'alice', revieweeId: 'bob', rating: 5, comment: 'Great', createdAt: new Date()
    }));
  });

  it('11. Rejects user setting feedback rating to 100', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await testEnv.withSecurityRulesDisabled(async (context: any) => {
        await context.firestore().collection('tasks').doc('taskForAlice').set({
          creatorId: 'alice', acceptedById: 'bob', status: 'completed'
        });
      });
    await assertFails(db.collection('feedback').doc('fb2').set({
      taskId: 'taskForAlice', reviewerId: 'alice', revieweeId: 'bob', rating: 100, comment: 'Great', createdAt: new Date()
    }));
  });

  it('12. Rejects user creating a profile without required fields', async () => {
    const db = testEnv.authenticatedContext('alice', { email: 'alice@taylors.edu.my', email_verified: true }).firestore();
    await assertFails(db.collection('users').doc('alice').set({
      name: 'Alice', credits: 2.0 // Missing email, trustScore, role, isActive, timestamps
    }));
  });
});
