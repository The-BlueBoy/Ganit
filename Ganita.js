/* =========================================================
   GANITA - MATHEMATICAL SOLVER
   ========================================================= */


/* ================= MAIN FUNCTION ================= */

function solveProblem() {

    const input = document
        .getElementById("problemInput")
        .value
        .trim();

    if (input === "") {

        showError("Please enter a mathematical problem.");

        return;
    }


    let result = null;


    /*
        Check for quadratic equation first.

        Examples:

        x² + 5x + 6 = 0
        2x² + 5x - 3 = 0
        x^2 - 4x + 3 = 0
    */

    if (
        input.includes("=") &&
        (
            input.toLowerCase().includes("x²") ||
            input.toLowerCase().includes("x^2")
        )
    ) {

        result = solveQuadratic(input);

    }


    /*
        Check for linear equation.
    */

    else if (
        input.includes("=") &&
        input.toLowerCase().includes("x")
    ) {

        result = solveLinearEquation(input);

    }


    /*
        Otherwise try arithmetic.
    */

    else {

        result = solveArithmetic(input);

    }


    if (!result) {

        showError(
            "Problem not recognized. Try 25 + 15, 2x + 5 = 15, or x² + 5x + 6 = 0."
        );

        return;
    }


    displayResult(result);
}


/* =========================================================
   ARITHMETIC
   ========================================================= */

function solveArithmetic(input) {

    let expression = input
        .replace(/×/g, "*")
        .replace(/÷/g, "/");


    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {

        return null;
    }


    try {

        const answer = Function(
            '"use strict"; return (' + expression + ')'
        )();


        if (!Number.isFinite(answer)) {

            return null;
        }


        let operation = "";


        if (input.includes("+")) {
            operation = "addition";
        }

        else if (input.includes("-")) {
            operation = "subtraction";
        }

        else if (
            input.includes("×") ||
            input.includes("*")
        ) {
            operation = "multiplication";
        }

        else if (
            input.includes("÷") ||
            input.includes("/")
        ) {
            operation = "division";
        }


        return {

            type: "arithmetic",

            problem: input,

            answer: cleanNumber(answer),

            operation: operation

        };

    }

    catch {

        return null;
    }
}


/* =========================================================
   LINEAR EQUATION
   ========================================================= */

function solveLinearEquation(input) {

    let equation = input
        .replace(/\s+/g, "")
        .replace(/−/g, "-")
        .toLowerCase();


    const sides = equation.split("=");


    if (sides.length !== 2) {

        return null;
    }


    const left = parseLinearSide(sides[0]);

    const right = parseLinearSide(sides[1]);


    if (!left || !right) {

        return null;
    }


    const coefficient =
        left.a - right.a;


    const constant =
        right.b - left.b;


    if (coefficient === 0) {

        return null;
    }


    const x =
        constant / coefficient;


    return {

        type: "linear",

        problem: input,

        coefficient: coefficient,

        constant: constant,

        x: cleanNumber(x),

        answer: "x = " + cleanNumber(x)

    };
}


/* =========================================================
   PARSE LINEAR SIDE
   ========================================================= */

function parseLinearSide(side) {

    let a = 0;

    let b = 0;


    side = side.replace(/-/g, "+-");


    if (side.startsWith("+")) {

        side = side.substring(1);
    }


    const terms = side.split("+");


    for (let term of terms) {

        if (term === "") {

            continue;
        }


        if (term.includes("x")) {

            let coefficient =
                term.replace("x", "");


            if (
                coefficient === "" ||
                coefficient === "+"
            ) {

                coefficient = 1;

            }

            else if (coefficient === "-") {

                coefficient = -1;

            }

            else {

                coefficient =
                    Number(coefficient);
            }


            if (Number.isNaN(coefficient)) {

                return null;
            }


            a += coefficient;

        }

        else {

            const number =
                Number(term);


            if (Number.isNaN(number)) {

                return null;
            }


            b += number;
        }
    }


    return {
        a: a,
        b: b
    };
}


/* =========================================================
   QUADRATIC EQUATION
   =========================================================

   General form:

   ax² + bx + c = 0

   Formula:

             -b ± √(b² - 4ac)
   x = -------------------------
                  2a

   ========================================================= */

function solveQuadratic(input) {

    let equation = input
        .replace(/\s+/g, "")
        .replace(/−/g, "-")
        .replace(/²/g, "^2")
        .toLowerCase();


    const sides = equation.split("=");


    if (sides.length !== 2) {

        return null;
    }


    /*
        We support equations where the right side is 0.
    */

    if (Number(sides[1]) !== 0) {

        return null;
    }


    const expression = sides[0];


    /*
        Match:

        ax² + bx + c
        x² + bx + c
        ax² + c
        etc.
    */

    const match = expression.match(
        /^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)$/
    );


    if (!match) {

        /*
            Try x² + bx + c
            where coefficient of x² is 1.
        */

        const simpleMatch = expression.match(
            /^x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)$/
        );


        if (!simpleMatch) {

            return null;
        }


        const a = 1;

        const b = parseCoefficient(simpleMatch[1]);

        const c = parseCoefficient(simpleMatch[2]);


        return calculateQuadratic(
            input,
            a,
            b,
            c
        );
    }


    let aText = match[1];

    let bText = match[2];

    let cText = match[3];


    let a = parseCoefficient(aText);

    let b = parseCoefficient(bText);

    let c = parseCoefficient(cText);


    if (
        a === null ||
        b === null ||
        c === null
    ) {

        return null;
    }


    return calculateQuadratic(
        input,
        a,
        b,
        c
    );
}


/* =========================================================
   PARSE COEFFICIENT
   ========================================================= */

function parseCoefficient(value) {

    if (value === "" || value === "+") {

        return 1;
    }


    if (value === "-") {

        return -1;
    }


    const number = Number(value);


    if (Number.isNaN(number)) {

        return null;
    }


    return number;
}


/* =========================================================
   CALCULATE QUADRATIC
   ========================================================= */

function calculateQuadratic(
    input,
    a,
    b,
    c
) {

    if (a === 0) {

        return null;
    }


    /*
        Discriminant

        D = b² - 4ac
    */

    const discriminant =
        (b * b) - (4 * a * c);


    let roots = [];

    let rootType = "";


    /*
        Two real roots
    */

    if (discriminant > 0) {

        const sqrtD =
            Math.sqrt(discriminant);


        const x1 =
            (-b + sqrtD) / (2 * a);


        const x2 =
            (-b - sqrtD) / (2 * a);


        roots = [
            cleanNumber(x1),
            cleanNumber(x2)
        ];


        rootType =
            "Two distinct real roots";
    }


    /*
        One repeated real root
    */

    else if (discriminant === 0) {

        const x =
            -b / (2 * a);


        roots = [
            cleanNumber(x)
        ];


        rootType =
            "One repeated real root";
    }


    /*
        Complex roots
    */

    else {

        const real =
            -b / (2 * a);


        const imaginary =
            Math.sqrt(-discriminant) /
            Math.abs(2 * a);


        roots = [

            {
                real: cleanNumber(real),
                imaginary: cleanNumber(imaginary)
            },

            {
                real: cleanNumber(real),
                imaginary: -cleanNumber(imaginary)
            }

        ];


        rootType =
            "Two complex roots";
    }


    return {

        type: "quadratic",

        problem: input,

        a: a,

        b: b,

        c: c,

        discriminant: cleanNumber(discriminant),

        roots: roots,

        rootType: rootType
    };
}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(result) {

    if (result.type === "arithmetic") {

        displayArithmetic(
            result
        );

    }

    else if (result.type === "linear") {

        displayLinear(
            result
        );

    }

    else if (result.type === "quadratic") {

        displayQuadratic(
            result
        );
    }
}


/* =========================================================
   ARITHMETIC OUTPUT
   ========================================================= */

function displayArithmetic(result) {

    const modern =
        document.getElementById("modernOutput");

    const ancient =
        document.getElementById("ancientOutput");


    modern.innerHTML = `

        <div class="section-box">

            <div class="label">
                Problem
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

        </div>


        <div class="section-box">

            <div class="label">
                Step-by-Step Solution
            </div>

            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        Identify the numbers and
                        mathematical operation.

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        Perform the operation.

                        <span class="equation">

                            ${escapeHTML(result.problem)}
                            =
                            ${result.answer}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        Obtain the final result.

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                Answer
            </div>

            <div class="answer-value">
                ${result.answer}
            </div>

        </div>


        <div class="algorithm">

            <h4>Algorithmic Thinking</h4>

            <div class="flow">
                Input → Operation → Calculation → Output
            </div>

        </div>

    `;


    ancient.innerHTML = `

        <div class="section-box">

            <div class="label">
                प्रश्न (Praśna)
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

            <p class="ancient-note">
                सङ्ख्या (Saṅkhyā) —
                Numerical quantities
            </p>

        </div>


        <div class="section-box">

            <div class="label">
                समाधान (Samādhāna)
            </div>

            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        सङ्ख्या (Saṅkhyā) को
                        पहचान करें।

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        गणना (Gaṇanā) की
                        प्रक्रिया लागू करें.

                        <span class="equation">

                            ${escapeHTML(result.problem)}
                            =
                            ${result.answer}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        उत्तर (Uttara) प्राप्त करें।

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                उत्तर (Uttara)
            </div>

            <div class="answer-value">
                ${result.answer}
            </div>

        </div>


        <div class="algorithm">

            <h4>
                गणना क्रम (Gaṇanā Krama)
            </h4>

            <div class="flow">
                सङ्ख्या → नियम → गणना → उत्तर
            </div>

        </div>

    `;
}


/* =========================================================
   LINEAR OUTPUT
   ========================================================= */

function displayLinear(result) {

    const modern =
        document.getElementById("modernOutput");

    const ancient =
        document.getElementById("ancientOutput");


    modern.innerHTML = `

        <div class="section-box">

            <div class="label">
                Linear Equation
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

        </div>


        <div class="section-box">

            <div class="label">
                Step-by-Step Solution
            </div>

            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        Rearrange the equation.

                        <span class="equation">
                            ${result.coefficient}x =
                            ${result.constant}
                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        Divide both sides by
                        ${result.coefficient}.

                        <span class="equation">

                            x =
                            ${result.constant}
                            ÷
                            ${result.coefficient}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        Therefore:

                        <span class="equation">
                            x = ${result.x}
                        </span>

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                Answer
            </div>

            <div class="answer-value">
                x = ${result.x}
            </div>

        </div>


        <div class="algorithm">

            <h4>Algorithmic Thinking</h4>

            <div class="flow">
                Equation → Unknown → Rules → Calculation → Answer
            </div>

        </div>

    `;


    ancient.innerHTML = `

        <div class="section-box">

            <div class="label">
                प्रश्न (Praśna)
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

            <p class="ancient-note">

                अज्ञात राशि (Ajñāta Rāśi) —
                Unknown quantity

            </p>

        </div>


        <div class="section-box">

            <div class="label">
                बीजगणितीय समाधान
                (Bījagaṇita Samādhāna)
            </div>

            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        अज्ञात राशि (Ajñāta Rāśi)
                        को अलग करें.

                        <span class="equation">
                            ${result.coefficient}x =
                            ${result.constant}
                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        नियमानुसार गणना
                        (Gaṇanā) करें.

                        <span class="equation">

                            x =
                            ${result.constant}
                            ÷
                            ${result.coefficient}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        अज्ञात राशि का मान:

                        <span class="equation">
                            x = ${result.x}
                        </span>

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                उत्तर (Uttara)
            </div>

            <div class="answer-value">
                x = ${result.x}
            </div>

        </div>


        <div class="algorithm">

            <h4>
                गणना क्रम (Gaṇanā Krama)
            </h4>

            <div class="flow">
                प्रश्न → अज्ञात राशि → नियम → गणना → उत्तर
            </div>

        </div>

    `;
}


/* =========================================================
   QUADRATIC OUTPUT
   ========================================================= */

function displayQuadratic(result) {

    const modern =
        document.getElementById("modernOutput");

    const ancient =
        document.getElementById("ancientOutput");


    let rootDisplay = "";


    if (result.roots.length === 1) {

        rootDisplay =
            `x = ${result.roots[0]}`;

    }

    else if (
        typeof result.roots[0] === "object"
    ) {

        rootDisplay = `
            x₁ = ${result.roots[0].real}
            + ${result.roots[0].imaginary}i
            <br>
            x₂ = ${result.roots[1].real}
            ${result.roots[1].imaginary < 0 ? "-" : "+"}
            ${Math.abs(result.roots[1].imaginary)}i
        `;

    }

    else {

        rootDisplay = `
            x₁ = ${result.roots[0]}
            <br>
            x₂ = ${result.roots[1]}
        `;
    }


    /* ---------- MODERN ---------- */

    modern.innerHTML = `

        <div class="section-box">

            <div class="label">
                Quadratic Equation
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

        </div>


        <div class="section-box">

            <div class="label">
                Step-by-Step Solution
            </div>


            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        Identify the coefficients.

                        <span class="equation">

                            a = ${result.a},
                            b = ${result.b},
                            c = ${result.c}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        Calculate the discriminant.

                        <span class="equation">

                            D = b² - 4ac

                        </span>

                        <span class="equation">

                            D =
                            (${result.b})² -
                            4(${result.a})(${result.c})

                        </span>

                        <span class="equation">

                            D = ${result.discriminant}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        Apply the quadratic formula.

                        <span class="equation">

                            x =
                            (-b ± √D) / 2a

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">4</div>

                    <div class="step-text">

                        Calculate the roots.

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                ${result.rootType}
            </div>

            <div class="answer-value">
                ${rootDisplay}
            </div>

        </div>


        <div class="algorithm">

            <h4>Algorithmic Thinking</h4>

            <div class="flow">

                Input
                →
                Identify a,b,c
                →
                Calculate D
                →
                Apply Formula
                →
                Roots

            </div>

        </div>

    `;


    /* ---------- ANCIENT ---------- */

    ancient.innerHTML = `

        <div class="section-box">

            <div class="label">
                प्रश्न (Praśna)
            </div>

            <div class="problem">
                ${escapeHTML(result.problem)}
            </div>

            <p class="ancient-note">

                बीजगणित (Bījagaṇita) —
                Algebraic calculation

            </p>

        </div>


        <div class="section-box">

            <div class="label">

                बीजगणितीय समाधान
                (Bījagaṇita Samādhāna)

            </div>


            <div class="steps">

                <div class="step">

                    <div class="step-number">1</div>

                    <div class="step-text">

                        राशियों (Rāśi) की पहचान करें।

                        <span class="equation">

                            a = ${result.a},
                            b = ${result.b},
                            c = ${result.c}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">2</div>

                    <div class="step-text">

                        विवेचक राशि की गणना करें।

                        <span class="equation">

                            D = b² - 4ac

                        </span>

                        <span class="equation">

                            D = ${result.discriminant}

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">3</div>

                    <div class="step-text">

                        नियमानुसार अज्ञात राशि
                        (Ajñāta Rāśi) निर्धारित करें।

                        <span class="equation">

                            x =
                            (-b ± √D) / 2a

                        </span>

                    </div>

                </div>


                <div class="step">

                    <div class="step-number">4</div>

                    <div class="step-text">

                        प्राप्त मान ही
                        उत्तर (Uttara) है।

                    </div>

                </div>

            </div>

        </div>


        <div class="answer">

            <div class="answer-title">
                उत्तर (Uttara)
            </div>

            <div class="answer-value">

                ${rootDisplay}

            </div>

        </div>


        <div class="algorithm">

            <h4>
                गणना क्रम (Gaṇanā Krama)
            </h4>

            <div class="flow">

                प्रश्न
                →
                राशि
                →
                नियम
                →
                गणना
                →
                अज्ञात राशि
                →
                उत्तर

            </div>

        </div>

    `;
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    document.getElementById("modernOutput").innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;


    document.getElementById("ancientOutput").innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;
}


/* =========================================================
   EXAMPLE BUTTON
   ========================================================= */

function setExample(value) {

    document.getElementById("problemInput").value = value;

    solveProblem();
}


/* =========================================================
   HELPER
   ========================================================= */

function cleanNumber(number) {

    if (Number.isInteger(number)) {

        return number;
    }


    return Number(
        number.toFixed(6)
    );
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   ENTER KEY
   ========================================================= */

document
    .getElementById("problemInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                solveProblem();
            }

        }
    );