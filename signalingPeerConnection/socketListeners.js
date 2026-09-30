


socket.on('availableOffers', offers=>{
    console.log("availableOffers", offers);
    createOffsetEls(offers);
});


socket.on('newOfferAwaiting', offers=>{
    createOffsetEls(offers);
})

function createOffsetEls(offers) {
    const answerEl = document.querySelector('#answer');
    offers.forEach(o => {
        const newOfferEl = document.createElement('dive');
        newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offerUserName}</button>`
        newOfferEl.addEventListener('click', ()=>answerOffer(o));
        answerEl.appendChild(newOfferEl);
    });
}