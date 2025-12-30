/// <reference types="cypress" />

describe('Navegación - Red Académica UNAMAD', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  describe('Navegación Principal', () => {
    it('debe mostrar todos los enlaces de navegación', () => {
      cy.visit('/feed');

      // Verificar que existan los enlaces principales
      const sections = ['feed', 'grupos', 'eventos', 'mensajes', 'notificaciones'];

      sections.forEach((section) => {
        // eslint-disable-next-line security/detect-non-literal-regexp
        cy.contains(new RegExp(section, 'i')).should('exist');
      });
    });

    it('debe navegar entre secciones correctamente', () => {
      // Feed -> Grupos
      cy.visit('/feed');
      cy.contains(/grupos/i).click();
      cy.url().should('include', '/groups');

      // Grupos -> Eventos
      cy.contains(/eventos/i).click();
      cy.url().should('include', '/events');

      // Eventos -> Feed
      cy.contains(/feed|inicio/i).click();
      cy.url().should('include', '/feed');
    });
  });

  describe('Página de Grupos', () => {
    beforeEach(() => {
      cy.visit('/groups');
    });

    it('debe mostrar la lista de grupos', () => {
      cy.get('main').should('be.visible');
      // Puede mostrar grupos o mensaje de "no hay grupos"
      cy.get('body').then(($body) => {
        if ($body.text().includes('grupo')) {
          cy.contains(/grupo/i).should('be.visible');
        }
      });
    });

    it('debe tener opción para crear grupo', () => {
      cy.get('button, a').contains(/crear|nuevo/i).should('be.visible');
    });
  });

  describe('Página de Eventos', () => {
    beforeEach(() => {
      cy.visit('/events');
    });

    it('debe mostrar la página de eventos', () => {
      cy.get('main').should('be.visible');
    });

    it('debe tener opción para crear evento', () => {
      cy.get('button, a').contains(/crear|nuevo/i).should('be.visible');
    });
  });

  describe('Página de Notificaciones', () => {
    it('debe acceder a notificaciones', () => {
      cy.visit('/feed');
      cy.get('[data-testid="notifications"], a[href*="notification"], button[aria-label*="notificacion"]')
        .first()
        .click();

      cy.url().should('include', '/notification');
    });
  });

  describe('Página de Perfil', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('debe mostrar información del usuario', () => {
      cy.fixture('users').then((users) => {
        // Debe mostrar nombre del usuario
        // eslint-disable-next-line security/detect-non-literal-regexp
        cy.contains(new RegExp(users.validUser.firstName, 'i')).should('be.visible');
      });
    });

    it('debe mostrar opciones de editar perfil', () => {
      cy.get('button, a').contains(/editar|configurar/i).should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ];

    viewports.forEach((viewport) => {
      it(`debe verse correctamente en ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/feed');

        // La página debe cargarse sin errores
        cy.get('main, [role="main"]').should('be.visible');

        // No debe haber overflow horizontal
        cy.document().then((doc) => {
          const body = doc.body;
          expect(body.scrollWidth).to.be.lte(viewport.width + 20);
        });
      });
    });
  });
});
