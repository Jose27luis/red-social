/// <reference types="cypress" />

describe('Autenticación - Red Académica UNAMAD', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    cy.clearLocalStorage();
  });

  describe('Página de Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('debe mostrar el formulario de login correctamente', () => {
      // Verificar elementos del formulario
      cy.get('input[type="email"], input[name="email"]').should('be.visible');
      cy.get('input[type="password"], input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');

      // Verificar enlace a registro
      cy.contains(/registr/i).should('be.visible');
    });

    it('debe mostrar error con credenciales inválidas', () => {
      cy.get('input[type="email"], input[name="email"]').type('invalid@unamad.edu.pe');
      cy.get('input[type="password"], input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Debe mostrar mensaje de error
      cy.contains(/error|inválid|incorrect/i).should('be.visible');
    });

    it('debe validar que el email sea institucional', () => {
      cy.get('input[type="email"], input[name="email"]').type('user@gmail.com');
      cy.get('input[type="password"], input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Debe mostrar error de email no institucional
      cy.contains(/institucional|@unamad|inválid/i).should('be.visible');
    });

    it('debe redirigir a registro al hacer click en el enlace', () => {
      cy.contains(/registr/i).click();
      cy.url().should('include', '/register');
    });
  });

  describe('Página de Registro', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('debe mostrar el formulario de registro correctamente', () => {
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[type="email"], input[name="email"]').should('be.visible');
      cy.get('input[type="password"], input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('debe validar campos requeridos', () => {
      // Intentar enviar formulario vacío
      cy.get('button[type="submit"]').click();

      // Debe mostrar errores de validación
      cy.get('input:invalid').should('have.length.at.least', 1);
    });

    it('debe rechazar emails no institucionales', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[name="firstName"]').type('Test');
        cy.get('input[name="lastName"]').type('User');
        cy.get('input[type="email"], input[name="email"]').type(users.invalidUser.email);
        cy.get('input[type="password"], input[name="password"]').type('Password123!');
        cy.get('button[type="submit"]').click();

        // Debe mostrar error
        cy.contains(/institucional|@unamad|inválid/i).should('be.visible');
      });
    });

    it('debe redirigir a login al hacer click en el enlace', () => {
      cy.contains(/iniciar sesión|login|ya tienes cuenta/i).click();
      cy.url().should('include', '/login');
    });
  });

  describe('Flujo de Login Exitoso', () => {
    it('debe iniciar sesión correctamente con credenciales válidas', () => {
      cy.fixture('users').then((users) => {
        cy.visit('/login');

        cy.get('input[type="email"], input[name="email"]').type(users.validUser.email);
        cy.get('input[type="password"], input[name="password"]').type(users.validUser.password);
        cy.get('button[type="submit"]').click();

        // Debe redirigir al feed
        cy.url().should('include', '/feed', { timeout: 10000 });

        // Debe almacenar tokens
        cy.window().its('localStorage.accessToken').should('exist');
      });
    });
  });

  describe('Protección de Rutas', () => {
    it('debe redirigir a login si no está autenticado', () => {
      cy.visit('/feed');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a login al acceder a perfil sin autenticación', () => {
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a login al acceder a grupos sin autenticación', () => {
      cy.visit('/groups');
      cy.url().should('include', '/login');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login primero
      cy.fixture('users').then((users) => {
        cy.login(users.validUser.email, users.validUser.password);
      });
    });

    it('debe cerrar sesión correctamente', () => {
      // Buscar y hacer click en logout
      cy.get('[data-testid="logout-button"], button:contains("Salir"), button:contains("Cerrar")').first().click();

      // Debe redirigir a login
      cy.url().should('include', '/login');

      // Tokens deben ser removidos
      cy.window().its('localStorage.accessToken').should('not.exist');
    });
  });
});
