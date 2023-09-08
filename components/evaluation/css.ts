export const CSS:string = ` <style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');

body {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: 'Open Sans', sans-serif; 
    counter-reset: step;

}

.step{
    margin-bottom: 10px;

}

.step::before{
    counter-increment:step;
    content: counter(step);
    display: block;
    font-size: 35px;
    font-weight: bold;
    text-align: center;
}

.title{
    font-size: 40px;
    margin-bottom: 40px;
    font-weight: bold;
}


</style>`;