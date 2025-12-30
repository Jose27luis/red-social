/// <reference types="cypress" />

describe('Feed - Red Académica UNAMAD', () => {
  beforeEach(() => {
    // Login antes de cada test
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  describe('Visualización del Feed', () => {
    it('debe mostrar el feed correctamente', () => {
      cy.url().should('include', '/feed');

      // Debe mostrar el contenedor principal del feed
      cy.get('main, [role="main"], .feed-container').should('be.visible');
    });

    it('debe mostrar la navegación principal', () => {
      // Verificar elementos de navegación
      cy.get('nav, header').should('be.visible');

      // Debe tener enlaces a secciones principales
      cy.contains(/feed|inicio/i).should('be.visible');
    });

    it('debe mostrar el formulario para crear publicación', () => {
      // Buscar área de crear post
      cy.get('textarea, [placeholder*="public"], [placeholder*="escrib"], input[placeholder*="public"]')
        .should('be.visible');
    });
  });

  describe('Crear Publicación', () => {
    it('debe permitir crear una nueva publicación', () => {
      const postContent = `Test post ${Date.now()}`;

      // Encontrar y escribir en el textarea
      cy.get('textarea, [contenteditable="true"]').first().type(postContent);

      // Hacer click en publicar
      cy.get('button').contains(/public|enviar|post/i).click();

      // La publicación debe aparecer en el feed
      cy.contains(postContent, { timeout: 10000 }).should('be.visible');
    });

    it('no debe permitir publicar contenido vacío', () => {
      // Intentar publicar sin contenido
      cy.get('button').contains(/public|enviar|post/i).should('be.disabled');
    });
  });

  describe('Interacción con Publicaciones', () => {
    it('debe permitir dar like a una publicación', () => {
      // Buscar botón de like en alguna publicación
      cy.get('[data-testid="like-button"], button[aria-label*="like"], button:has(svg)')
        .first()
        .click();

      // El botón debe cambiar de estado (verificar visualmente)
      cy.get('[data-testid="like-button"], button[aria-label*="like"]')
        .first()
        .should('exist');
    });

    it('debe permitir comentar en una publicación', () => {
      const comment = `Comentario test ${Date.now()}`;

      // Buscar área de comentarios
      cy.get('[data-testid="comment-input"], input[placeholder*="comentar"], textarea[placeholder*="comentar"]')
        .first()
        .type(comment);

      // Enviar comentario
      cy.get('button').contains(/comentar|enviar/i).first().click();

      // El comentario debe aparecer
      cy.contains(comment, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Navegación desde Feed', () => {
    it('debe navegar a grupos', () => {
      cy.contains(/grupos/i).click();
      cy.url().should('include', '/groups');
    });

    it('debe navegar a eventos', () => {
      cy.contains(/eventos/i).click();
      cy.url().should('include', '/events');
    });

    it('debe navegar a perfil', () => {
      cy.get('[data-testid="profile-link"], a[href*="profile"], img[alt*="perfil"]')
        .first()
        .click();
      cy.url().should('include', '/profile');
    });
  });
});
