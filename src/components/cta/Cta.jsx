import React from 'react'
import '../cta/Cta.css'
import lofospot from "../../assets/logo/logoFE.png"
import Background from '../../styles/Background'; 

const Cta = () => {
  
  return (
    <>
    <nav className='navbar'>
       <Background />  
      <div class="loader">
        <div class="logo"><a href="/"><img className='logott' src={lofospot} alt="" /></a></div>
        <div class="box"></div>
        <div class="box"></div>
        <div class="box"></div>
      </div>        
    </nav>  
    </>
  );
};
export default Cta;