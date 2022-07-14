/**
 * Complex number a + ib.
 */
class ComplexNumber {

    /**
     * Constructor for the complex number a + ib.
     * @param {Number} a Real value a.
     * @param {*} b Imaginary coefficient b.
     */
    constructor(a, b) {
        this.re = a;
        this.im = b
    }

    /**
     * Add z to the current number.
     * @param {ComplexNumber} z Number to be added.
     */
    add(z) {
        this.re += z.re;
        this.im += z.im;
    }

    /**
     * Multiply the current number by z and returns the result.
     * @param {ComplexNumber} z Complex umber to be multiplied by.
     * @returns Result of the multiplication.
     */
    multiply(z) {
        return new ComplexNumber(
            this.re * z.re - this.im * z.im,
            this.re * z.im + this.im * z.re
        );
    }

    /**
     * Scale current number by a real factor r.
     * @param {Number} r Real factor to be scaled by.
     * @returns The scaled complex number.
     */
    scale(r) {
        return new ComplexNumber(this.re * r, this.im * r);
    }

    /**
     * Divide the current number by a real number r and returns the result.
     * @param {Number} r Real number to be divided by.
     * @returns Result of the division.
     */
    divide(r) {
        return new ComplexNumber(this.re / r, this.im / r);
    }

    /**
     * Get the conjugate.
     * @returns The conjugate.
     */
    conj() {
        return new ComplexNumber(this.re, -this.im);
    }

    /**
     * Get the absolute value, that is A in A*e^(i*phi)
     * @returns The absolute value.
     */
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    /**
     * Get the phase, that is phi in A*e^(i*phi)
     * @returns The phase.
     */
    phase() {
        return Math.atan2(this.im, this.re);
    }

    /**
     * Get the ral part.
     * @returns The real part.
     */
    real() {
        return this.re;
    }

    /**
     * Get the ral part.
     * @returns The real part.
     */
    imag() {
        return this.im;
    }

}

/**
 * Time-Frequency analysis tools
 */
const analysisTools = new function () {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    publicAPIs.dft = (x, L, maxFreq, df) => {
        const X = [];
        const N = x.length;

        for (let freq = 0; freq < maxFreq; freq += df) {
            let sum = new ComplexNumber(0, 0);

            for (let n = 0; n < N; n++) {
                const phi = (- 2 * Math.PI * L * (n / N) * freq);
                const c = new ComplexNumber(Math.cos(phi), Math.sin(phi));
                sum.add(c.scale(x[n]));
            }
            sum = sum.divide(N);

            X.push({
                re: sum.real(),
                im: sum.imag(),
                freq: freq,
                amp: sum.abs(),
                phase: sum.phase()
            });
        }
        return X;
    }

    return publicAPIs;
}