const style = `
.mint-group {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 15px;
    justify-content: center;
    .old-panel, .new-panel {
        max-width: 500px;
        width: 100%;
    }
    .couple-column {
        display: grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-auto-flow: column;
        column-gap: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .mint-group {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .couple-column {
        display: block;
    }
}`;

export default style;