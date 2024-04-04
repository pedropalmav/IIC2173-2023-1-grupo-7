const orm = require('../models');

async function createNewAuction(auction_json) {
    const { event_id } = auction_json;

    const event = await orm.ticket.findOne({ where: { event_id }});
    if (!event) {
        console.log(`Could not find the event (${event_id}) for the auction.`);
        return;
    }

    await orm.Auction.create(auction_json);
    console.log("New auction saved to database.")
}

async function handleAcceptance(auction_json) {
    const { auction_id, proposal_id } = auction_json;
    
    const auction = await orm.Auction.findOne({where: {auction_id, proposal_id: ""}});
    const acceptedProposal = await orm.Auction.findOne({where: {auction_id, proposal_id}});

    const proposals = await orm.Auction.findAll({where: {auction_id, type: "proposal"}});
    proposals.forEach(async (proposal) => {
        proposal.status = proposal.id === acceptedProposal.id ? "accepted" : "rejected";
        await proposal.save();
    });

    const event = await acceptedProposal.getEvent();
    const availableTickets = await event.getAvailableTickets();

    if (acceptedProposal.group_id == 7) {
        if (availableTickets == null) {
            await orm.AvailableTickets.create({
                event_id: event.event_id,
                amount: acceptedProposal.quantity,
            });
        } else {
            availableTickets.amount += acceptedProposal.quantity;
            await availableTickets.save();
        }
    } else {
        if (availableTickets == null) {
            console.warn("No available tickets for event: " + event.event_id);
        } else {
            availableTickets.amount -= acceptedProposal.quantity;
            await availableTickets.save();
        }
    }

    auction.status = "done";
    await auction.save();
}

async function handleRejection(auction_json) {
    const { auction_id, proposal_id } = auction_json;

    const rejectedProposal = await orm.Auction.findOne({where: {auction_id, proposal_id}});
    rejectedProposal.status = "rejected";
    await rejectedProposal.save();
}

exports.handleAuction = async (message_json) => {
    try {
        const { type } = message_json;
        
        switch (type) {
            case "offer":
                await createNewAuction(message_json);
                break;
            case "proposal":
                await createNewAuction(message_json);
                break;
            case "acceptance":
                await handleAcceptance(message_json);
                break;
            case "rejection":
                await handleRejection(message_json);
                break;
            default:
                console.log("Unknown auction type: ", type);
        }
    } catch (error) {
        console.log("Error while handling auction: ", error);
    }
}
