const navMenu = document.getElementById('nav-menu'),
   navToggle = document.getElementById('nav-toggle'),
   navClose = document.getElementById('nav-close')

if (navToggle) {
   navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu')
   })
}

if (navClose) {
   navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu')
   })
}

const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
   const navMenu = document.getElementById('nav-menu')
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))




const swiperHome = new Swiper('.home__swiper', {
   loop: true,
   effect: 'fade',
   parallax: true,
   speed: 1000,
   grabCursor: true,

   pagination: {
      el: '.swiper-pagination',
      clickable: true,
   },
   autoplay: {
      delay: 5000,
      disableOnInteraction: false,
   }
})



gsap.defaults({ opacity: 0, ease: 'power4.out', duration: 1.4, })

const tl = gsap.timeline()
tl.from('.home__img', { y: 200, stagger: 0.15 }, '.3')
   .from('.nav > *', { y: -30 }, '.9')
   .from('.home__data', { y: 60 }, '1.2')
   .from('.home__info', { y: 100 }, '1.5')
   .from('.home .swiper-pagination', { scale: 0, opacity: 1 }, '1.5')