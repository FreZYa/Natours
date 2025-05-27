const stripe = Stripe('pk_test_51RT4wXK51ANe3rhNX0aVAKNwHLQ3xcG7MaFWbY2Z1vToJFSb3DyFjBHXhvjWOV2KLLqp5LE6DckiXKoUJo7sjYGL00yM1vkmAp')

export const bookTour = async (tourId) => {
    try {
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (error) {
        console.log(error);
        showAlert('error', error);
    }
}
