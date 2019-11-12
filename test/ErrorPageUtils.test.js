import ErrorPageUtils from "../src/ErrorPageUtils";

describe('ErrorPageUtils', () => {
    it('is found', () => {
        expect(ErrorPageUtils).toBeDefined();
    });

    it('able to remove all the dom children', () => {
        const e1 = document.createElement('div');
        const e2 = document.createElement('div');
        const e3 = document.createElement('div');
        e1.appendChild(e2);
        e1.appendChild(e3);

        expect(e1.childNodes.length).toBe(2);
        ErrorPageUtils.removeAllChildren(e1);
        expect(e1.childNodes.length).toBe(0);
    });

    it('build error page', () => {
        const errPage = ErrorPageUtils.buildErrorPage()
        const expectedHTML = `
            <p>
                <span style="font-size: 6rem; border: 1px solid #ccc !important; border-radius: 4px; padding: 1rem 4rem 1rem 4rem;">😕</span>
            </p>
            <p style="font-size: 2rem; color: #460f0f;">
                Could NOT reach Skills Service.
            </p>
            <div>Please contact skills's server administrator. </div>`
        const flattenHTML = expectedHTML.replace(/\n|\s{2,}/gi, '')
        expect(errPage.innerHTML).toBe(flattenHTML);
    });
});
