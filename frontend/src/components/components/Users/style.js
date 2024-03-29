const style = `
.user-card {
    display: inline-block;
    max-width: 250px;
    height: 300px;
    border-radius: 10px;
    padding: 40px 20px;
    background: rgba(56,51,51,0.15);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
    -webkit-backdrop-filter: blur(9.4px);
    backdrop-filter: blur(9.4px);
    -webkit-backdrop-filter: blur(9.4px);
    flex: 1 0 250px;
    box-sizing: border-box;
    margin: 0.25em !important;
    border: 1px solid rgba(56,51,51,0.15);
    .avatar img{
        width: 110px;
        height: 110px;
        border-radius: 50%;
    }
    @media screen and (min-width: 1000px) and (max-width: 1300px) {
        max-width: calc(25% - 1em);
    }
    
    @media screen and (min-width: 600px) and (max-width: 1000px) {
        max-width: calc(50% - 1em);
    }
}

@media screen and (max-width: 600px) {
    .user-list {
        justify-content: center;
    }
}`;

export default style;