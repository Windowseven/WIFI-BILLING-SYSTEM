// controllers/OfferController.js
// Handles free offer logic when device connects

const OfferService = require('../services/offerservice');

module.exports = {

    // Called when MAC connects
    async handleOffer(req, res) {
        try {
            const { mac_address } = req.body;

            if (!mac_address) {
                return res.status(400).json({ error: "MAC address required" });
            }

            // 1. Check if user already exists
            let user = await OfferService.checkIfNewUser(mac_address);

            // 2. If new, register user
            if (!user) {
                const userId = await OfferService.registerNewUser(mac_address);
                user = { id: userId, got_free_offer: 0 };
            }

            // 3. If user already got free offer → skip
            if (user.got_free_offer === 1) {
                return res.json({ message: "User already received free offer" });
            }

            // 4. Create free voucher
            const voucherId = await OfferService.generateFreeVoucher(user.id);

            // 5. Mark user
            await OfferService.markOfferGiven(user.id);

            res.json({
                message: "Free offer assigned successfully",
                voucher_id: voucherId
            });

        } catch (error) {
            console.error("Offer Error:", error);
            res.status(500).json({ error: "Server error generating offer" });
        }
    }
};
