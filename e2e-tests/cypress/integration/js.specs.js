const wsTimeout = 3000;
const iFrameTimeout = 3000;

context("Native JS Tests", () => {
  it("global event show correct results", () => {
    cy.createDefaultProject();

    const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
    Cypress.Commands.add("clickSubmit", () => {
      cy.get(`${sendEventViaDropdownId} .btn`).click();
    });
    cy.visit("/native/index.html");

    cy.wait(wsTimeout); // allow for the ui web-socket handshake to complete

    cy.clickSubmit();
    
    cy.get('[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
    cy.get('[data-cy=globalEventResult]').contains('"pointsEarned": 50')
    cy.get('[data-cy=globalEventResult]').contains('"skillApplied": true')
    cy.get('[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
  });

  it("global event show correct results (skills reported directly to backend endpoint)", () => {
    cy.createDefaultProject();
    cy.visit("/native/index.html");

    cy.wait(wsTimeout); // allow for the ui web-socket handshake to complete

    cy.reportSkillForUser("IronMan", "user1");

    cy.get('[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
    cy.get('[data-cy=globalEventResult]').contains('"pointsEarned": 50')
    cy.get('[data-cy=globalEventResult]').contains('"skillApplied": true')
    cy.get('[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
  });

  it('global event does not update when skill reported for a different project', () => {
    cy.createDefaultProject()
    cy.createDefaultTinyProject('proj2')
    cy.visit("/native/index.html");

    cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

    cy.reportSkillForUser('IronMan', 'user1', 'proj2')

    cy.get('[data-cy=globalEventResult]').should('be.empty');
  })

  it('global event is not reported when skill is not applied (skill reported directly to backend endpoint)', () => {
    cy.createDefaultProject()
    cy.reportSkillForUser('IronMan', 'user1')

    cy.visit("/native/index.html");

    cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

    cy.reportSkillForUser('IronMan', 'user1')

    cy.get('[data-cy=globalEventResult]').should('be.empty');
  })

  it('global event is not reported when skill is not applied', () => {
    cy.createDefaultProject()
    cy.reportSkillForUser('IronMan', 'user1')

    cy.visit("/native/index.html");
    
    const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
    Cypress.Commands.add("clickSubmit", () => {
      cy.get(`${sendEventViaDropdownId} .btn`).click();
    });

    cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

    cy.clickSubmit()

    cy.get('[data-cy=globalEventResult]').should('be.empty');
  })

  it('global event is reported even when skill is not applied when notifyIfSkillNotApplied=true ', () => {
    cy.createDefaultProject()
    cy.reportSkillForUser('IronMan', 'user1')

    cy.visit("/native/index.html");
    
    const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
    Cypress.Commands.add("clickSubmit", () => {
      cy.get(`${sendEventViaDropdownId} .btn`).click();
    });

    cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

    cy.get('[type="checkbox"]').check() 
    cy.clickSubmit()

    cy.get('[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
    cy.get('[data-cy=globalEventResult]').contains('"pointsEarned": 0')
    cy.get('[data-cy=globalEventResult]').contains('"skillApplied": false')
    cy.get('[data-cy=globalEventResult]').contains('"explanation": "This skill reached its maximum points"')
  })

  it("skill display", () => {
    cy.createDefaultTinyProject();
    cy.server()
      .route("/api/users/user1/token")
      .as("getToken");
    cy.backendPost("/api/projects/proj1/skills/Thor", {
      userId: "user1",
      timestamp: Date.now()
    });
    cy.visit("/native/clientDisplay.html");
    cy.wait(iFrameTimeout);

    cy.iframe(body => {
      cy.wrap(body).contains("My Level");
      cy.wrap(body).contains("50 Points earned Today");
      cy.wrap(body).contains("Subject 0");

      cy.wrap(body)
        .find(".skills-page-title-text-color")
        .should("have.css", "background-color")
        .and("equal", "rgb(255, 255, 255)");
    });
  });

  it("skill display - summary only", () => {
    cy.createDefaultTinyProject();
    cy.server()
      .route("/api/users/user1/token")
      .as("getToken");
    cy.backendPost("/api/projects/proj1/skills/Thor", {
      userId: "user1",
      timestamp: Date.now()
    });
    cy.visit("/native/clientDisplay.html?isSummaryOnly=true");
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      cy.wrap(body).contains("My Level");
      cy.wrap(body).contains("50 Points earned Today");
      cy.wrap(body)
        .contains("Subject 0")
        .should("not.exist");

      // verify that there is no background set
      // cypress always validates against rgb
      cy.wrap(body)
        .find(".skills-page-title-text-color")
        .should("have.css", "background-color")
        .and("equal", "rgb(255, 255, 255)");
    });
  });

  it("skill display - theme", () => {
    cy.createDefaultTinyProject();
    cy.server()
      .route("/api/users/user1/token")
      .as("getToken");
    cy.backendPost("/api/projects/proj1/skills/Thor", {
      userId: "user1",
      timestamp: Date.now()
    });
    cy.visit("/native/clientDisplay.html?themeName=Dark Blue");
    cy.wait("@getToken");
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      cy.wrap(body).contains("My Level");
      cy.wrap(body).contains("50 Points earned Today");
      cy.wrap(body).contains("Subject 0");

      // verify dark blue background of hex #152E4d
      // cypress always validates against rgb
      cy.wrap(body)
        .find(".skills-page-title-text-color")
        .should("have.css", "background-color")
        .and("equal", "rgb(21, 46, 77)");
    });
  });

  it("skill display - summary only - theme", () => {
    cy.createDefaultTinyProject();
    cy.server()
      .route("/api/users/user1/token")
      .as("getToken");
    cy.backendPost("/api/projects/proj1/skills/Thor", {
      userId: "user1",
      timestamp: Date.now()
    });
    cy.visit(
      "/native/clientDisplay.html?themeName=Dark Blue&isSummaryOnly=true"
    );
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      // cy.wait('@getToken')
      cy.wrap(body).contains("My Level");
      cy.wrap(body).contains("50 Points earned Today");
      cy.wrap(body)
        .contains("Subject 0")
        .should("not.exist");

      // verify dark blue background of hex #152E4d
      // cypress always validates against rgb
      cy.wrap(body)
        .find(".skills-page-title-text-color")
        .should("have.css", "background-color")
        .and("equal", "rgb(21, 46, 77)");
    });
  });

  it("client display should display an error if skills service is down", () => {
    cy.createDefaultTinyProject();
    cy.server()
      .route({
        method: "GET",
        url: "/public/status",
        status: 503, // server is down
        response: {}
      })
      .as("getStatus");
    cy.visit("/native/clientDisplay.html");
    cy.wait("@getStatus");

    cy.contains("Could NOT reach Skills Service");
  });

  it("only display skills up-to the provided version", () => {
    const noVersionPoints = 'Earn up to 200 points';
    const v1Points = 'Earn up to 150 points';
    const v0Points = 'Earn up to 100 points';
    cy.createDefaultTinyProject();
    cy.server()
      .route("/api/users/user1/token")
      .as("getToken");
    cy.backendAddSkill("skillv1", 1);
    cy.backendAddSkill("skillv2", 2);
    cy.visit("/native/clientDisplay.html");
    cy.wait("@getToken");
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      cy.wrap(body).contains(noVersionPoints);
    });

    cy.visit("/native/index.html");
    cy.visit("/native/clientDisplay.html?skillsVersion=1");
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      cy.wrap(body).contains(v1Points);
    });

    cy.visit("/native/index.html");
    cy.visit("/native/clientDisplay.html?skillsVersion=0");
    cy.wait(iFrameTimeout);
    cy.iframe(body => {
      cy.wrap(body).contains(v0Points);
    });
  });
});
