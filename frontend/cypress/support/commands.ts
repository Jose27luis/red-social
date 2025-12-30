/// <reference types="cypress" />

// ***********************************************
// Custom commands for Red Academica UNAMAD E2E tests
// ***********************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       * @param email - User email
       * @param password - User password
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Login via API (faster, bypasses UI)
       * @param email - User email
       * @param password - User password
       */
      loginViaApi(email: string, password: string): Chainable<void>;

      /**
       * Logout the current user
       */
      logout(): Chainable<void>;

      /**
       * Register a new user
       * @param userData - User registration data
       */
      register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        department?: string;
        career?: string;
      }): Chainable<void>;

      /**
       * Check if element contains text (case insensitive)
       */
      containsText(text: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Login command via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to feed
  cy.url().should('include', '/feed');
});

// Login command via API (faster)
Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    // Store tokens in localStorage
    window.localStorage.setItem('accessToken', response.body.accessToken);
    window.localStorage.setItem('refreshToken', response.body.refreshToken);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  window.localStorage.removeItem('user');
  cy.visit('/login');
});

// Register command via UI
Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('input[name="firstName"]').type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  if (userData.department) {
    cy.get('input[name="department"]').type(userData.department);
  }
  if (userData.career) {
    cy.get('input[name="career"]').type(userData.career);
  }
  cy.get('button[type="submit"]').click();
});

// Contains text (case insensitive)
Cypress.Commands.add('containsText', (text: string) => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  return cy.contains(new RegExp(text, 'i')) as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
});

export {};
