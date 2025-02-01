import { api } from '../utils/api-client.js';

class BookingWidget extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="dnbv-booking-widget">
                <form id="bookingForm">
                    <input
                        type="date"
                        id="checkIn"
                        class="dnbv-date-picker"
                        required
                    >
                    <input
                        type="date"
                        id="checkOut"
                        class="dnbv-date-picker"
                        required
                    >
                    <button
                        type="submit"
                        class="dnbv-submit-button"
                    >
                        Check Availability
                        <div class="loading-spinner"></div>
                    </button>
                </form>
                <div id="errorMessage" class="dnbv-error"></div>
                <div id="availabilityResults"></div>
            </div>
        `;

        this.form = this.querySelector('#bookingForm');
        this.errorDiv = this.querySelector('#errorMessage');
        this.resultsDiv = this.querySelector('#availabilityResults');
        this.submitButton = this.querySelector('.dnbv-submit-button');
    }

    connectedCallback() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    validateDates(checkIn, checkOut) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate < today) {
            throw new Error('Check-in date cannot be in the past');
        }
        if (checkOutDate <= checkInDate) {
            throw new Error('Check-out date must be after check-in date');
        }
        if ((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24) > 30) {
            throw new Error('Maximum stay is 30 days');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.errorDiv.textContent = '';
        this.submitButton.classList.add('loading');

        const checkIn = this.querySelector('#checkIn').value;
        const checkOut = this.querySelector('#checkOut').value;

        try {
            this.validateDates(checkIn, checkOut);
            const result = await api.checkAvailability(checkIn, checkOut);
            this.displayResults(result);
        } catch (error) {
            this.errorDiv.textContent = error.message || 'Unable to check availability. Please try again.';
        } finally {
            this.submitButton.classList.remove('loading');
        }
    }

    displayResults(data) {
        this.resultsDiv.textContent = JSON.stringify(data, null, 2);
    }
}

customElements.define('dnbv-booking', BookingWidget);
