import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {

  containerStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0',
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    overflowX: 'hidden',
  },

  sectionStyle: {
    width: '100%',           
    marginTop: '0',         
    marginRight: 'auto',     
    marginBottom: '12px',   
    marginLeft: 'auto',      
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    flexDirection: 'row',
  },

  textContainerStyle: {
    maxWidth: '50%',
    marginTop: '-10%',
    textAlign: 'left',
    wordBreak: 'break-word',
  },

  imageContainerStyle: {
    position: 'relative',
    width: '45%',
  },

  imageStyle: {
    width: '100%',
    borderRadius: '80% 50% 80% 50%',
  },

  heading: {
    marginTop: '20px',
    fontSize: '3.5rem',
    fontWeight: 'bold',
    fontFamily: 'Raleway, sans-serif',
    color: '#007FFF',
  },

  Paragraph: {
    color: 'black',
    marginTop: '20%',
    width:'auto'
  },

  buttonStyle: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#5a67d8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },

  textParagraphStyle: {
    textAlign: 'left',
    wordBreak: 'break-word',
    marginTop: '20px',
  },

  //styles for  div2 named sectionStyle2
  sectionStyle2: {
    width: '100%',          
    marginTop: '10%',          
    marginRight: 'auto',        
    marginLeft: 'auto',      
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    flexDirection: 'row',
  },
  
  textContainerStyle2: {
      display: 'flex',
      marginBottom: '30%',
      flexDirection: 'column',
      alignItems: 'flex-start',
      maxWidth: '50%',
      textAlign: 'left',
      wordBreak: 'break-word',
      marginTop: '15%'
  },

  textParagraphStyle: {
    textAlign: 'left',
    wordBreak: 'break-word',
    marginTop: '20px',
  },

  imageContainerStyle2: {
      position: 'relative',
      marginTop: '-15%',
      width: '45%',
      textAlign: 'left',
    },

  imageStyle2: {
    width: '100%',
    borderRadius: '80% 50% 80% 50%',
  },

  Paragraph2: {
    color: 'black',
    marginRight: 'auto',
    width: 'auto'
  },

  buttonStyle2: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#5a67d8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },

  //styles for  div3 named sectionStyle3

  sectionStyle3: {
    width: '100%',
    marginRight: 'auto',
    marginBottom: '20%',
    marginLeft: 'auto',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', 
    padding: '0 20px',
    boxSizing: 'border-box',
    flexDirection: 'column', 
  },

  textContainerStyle3: {
    maxWidth: '50%',
    marginTop: '-20%',
    textAlign: 'left',
  },

  heading3: {
    marginTop: '30%',
    marginLeft: '10%',
    padding: '0 10px',
    position: 'relative',
    fontSize: '3.5rem',
    fontWeight: 'bold',
    fontFamily: 'Raleway, sans-serif',
    color: '#007FFF',
  },

  container: {
  width: '100%', 
  maxWidth: '300px', 
  overflow: 'hidden',
  backgroundColor: 'white',
  border: '1px solid #e5e7eb', 
  borderRadius: '0.75rem', 
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
  position: 'relative',

},

  circularPicture: {
    width: '5rem', 
    height: '5rem', 
    marginLeft: '5%',
    marginTop: '5%',
    borderRadius: '50%', 
    objectFit: 'cover', 
    marginRight: '1rem', 
    },
      
  content: {
    padding: '1.5rem', 
    position: 'relative',
    zIndex: '10',
  },
  
  title: {
    fontSize: '1.25rem', 
    fontWeight: '600', 
    color: '#1f2937', 
  },
  
  description: {
    marginTop: '0.5rem', 
    color: '#4b5563', 
  },

  innerContainer: {
    marginLeft: 'auto', 
    marginRight: 'auto', 
    width: '100%', 
    maxWidth: '1200px', 
    height: 'auto', 
    padding: '20px',
    backgroundColor: 'transparent', 
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column', 
    gap: '20px', 
    alignItems: 'center', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
    borderRadius: '8px', 
  },

  rowContainer: {
    width: '100%', 
    display: 'flex',
    justifyContent: 'center', 
    gap: '20px', 
  },


  // Media Queries for responsiveness
  '@media (max-width: 768px)': {
    sectionStyle: {
      flexDirection: 'column', 
      height: 'auto',
    },
    sectionStyle2: {
      flexDirection: 'column', 
      height: 'auto',
      padding: '0 10px',
    },
    textContainerStyle: {
      maxWidth: '90%', 
      marginTop: '0',
    },
    textContainerStyle2: {
      maxWidth: '90%', 
      marginBottom: '10%',
    },
    imageContainerStyle: {
      width: '90%', 
      marginBottom: '20px',
    },
    imageContainerStyle2: {
      width: '90%', 
      marginTop: '10%',
    },
    Paragraph2: {
      marginRight: '0', 
      textAlign: 'center',
    },
    heading: {
      fontSize: '2.5rem', 
    },
    Paragraph: {
      fontSize: '1.5rem', 
    },
  },

  sectionStyle3: {
    flexDirection: 'column', 
  },

  innerContainer: {
    width: '100%', 
    marginLeft: '50%', 
    marginRight: 'auto', 
    marginBottom: '50%'
  },

  container: {
    width: '90%', 
  },
}


const AboutUs = () => {

  const navigate = useNavigate();

  return (
    <div style={styles.containerStyle}>

      {/* content number 1 of the page */}

      <div style={styles.sectionStyle}>
        <div style={styles.textContainerStyle}>
          <h4 style={styles.heading}>   </h4>
          <h1 style={styles.Paragraph}>Breaking Barriers, Building Futures</h1>
          <p style={styles.textParagraphStyle}>
            Our mission is to create inclusive opportunities for persons with disabilities, recognizing their potential and the value they bring.
            We are dedicated to fostering a supportive environment where diverse talents can thrive, driving innovation and success for both individuals and a company.
          </p>
          <button style={styles.buttonStyle} onClick={() => navigate('/signup')}>Get Started With Us</button>
        </div>
        <div style={styles.imageContainerStyle}>
          <img src="./src/imgs/pwd2.jpg" alt="PWD" style={styles.imageStyle}/>
        </div>
      </div>

      {/* content number 2 of the page */}
      <div style={styles.sectionStyle2}>
        <div style={styles.imageContainerStyle2}>
          <img src="./src/imgs/pwd3.jpg" alt="COMPANY" style={styles.imageStyle2}/>
        </div>
        <div style={styles.textContainerStyle2}>
          <h1 style={styles.Paragraph2}>Unlock Potential, Amplify Success</h1>
          <p style={styles.textParagraphStyle}>
          We envision a future where businesses harness the unique strengths of persons with disabilities, leading to enhanced creativity and growth.
            Our goal is to create pathways that drive mutual success and progress, fostering a culture of inclusivity that enriches organizations and transforms industries.
            By integrating diverse talents, we help companies unlock their full potential and achieve sustainable success.
          </p>
          <button style={styles.buttonStyle} onClick={() => navigate('/signup')}>Get Started With Us</button>
        </div>
      </div>

      {/* content number 3 of the page */}

      <div style={styles.sectionStyle3}>
        
      <div style={styles.textContainerStyle3}>
          <h4 style={styles.heading3}>Roles</h4>

          <div style={styles.innerContainer}>
          
        <div style={{...styles.rowContainer, justifyContent: 'center'}}>
          <div style={styles.container}>
              <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                <p style={styles.title}>Kyle Aguas</p>
                <p style={styles.description}>
                 description here. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore ab, quod perspiciatis reprehenderit nam optio sit et aspernatur officia nemo non quibusdam nulla, earum adipisci sunt. Nisi iste porro consequuntur?
                </p>
              </div>
          </div>
        </div>

    {/*3 cards in one row */}
    <div style={styles.rowContainer}>
          <div style={styles.container}>
              <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                <p style={styles.title}>Mitsui Ortega</p>
                <p style={styles.description}>
                description here. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam voluptatum vitae ipsa obcaecati pariatur impedit ullam eligendi quae, dolorem quam, minima laboriosam accusamus nisi, quidem eos accusantium excepturi sapiente maiores.
                </p>
              </div>
            </div>
            
          
          <div style={styles.container}>
              <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                <p style={styles.title}>Liv Centeno</p>
                <p style={styles.description}>
                description here. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates fugit ratione sapiente quo quidem sint minima deleniti neque atque, rem blanditiis enim, necessitatibus quasi? Adipisci maxime aperiam iste quasi saepe?
              </p>
            </div>
          </div>

          <div style={styles.container}>
              <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
                <div style={styles.gradientOverlay}></div>
                <div style={styles.content}>
                <p style={styles.title}>Carlos Miguel Bundac</p>
                <p style={styles.description}>
                description here. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto ducimus nisi delectus animi tempora sunt. Assumenda molestias atque voluptas impedit doloribus, vero recusandae labore, mollitia explicabo natus sit ipsa repellat!
              </p>
            </div>
            </div>
    </div>


    <div style={styles.rowContainer}>

          <div style={styles.container}>
            <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
              <div style={styles.gradientOverlay}></div>
              <div style={styles.content}>
              <p style={styles.title}>Ace Pleno</p>
              <p style={styles.description}>
              description here. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Itaque doloribus tenetur a explicabo ducimus nisi quidem molestias, eaque unde recusandae voluptatibus, distinctio quae, consectetur adipisci minus mollitia! Ea, quo. Ab?
              </p>
            </div>
          </div>


          <div style={styles.container}>
            <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
              <div style={styles.gradientOverlay}></div>
              <div style={styles.content}>
              <p style={styles.title}>Kevin Guia</p>
              <p style={styles.description}>
              description here. Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci distinctio autem, perferendis et earum, ipsum sunt cum magnam incidunt inventore accusantium vero laudantium! Neque asperiores modi dolores sapiente ad impedit.
              </p>
            </div>
          </div>

          <div style={styles.container}>
            <img src="./src/imgs/pwd1.jpg" alt="" style={styles.circularPicture}/>
              <div style={styles.gradientOverlay}></div>
              <div style={styles.content}>
              <p style={styles.title}>Joshua Brioso</p>
              <p style={styles.description}>
              description here. Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis omnis fuga vitae natus laborum laudantium harum reprehenderit. Accusamus, quos aspernatur quae ipsam autem incidunt, maxime consequuntur veritatis dolorem dolorum aut!
              </p>
            </div>
          </div>

      </div>

    </div>

  </div>

</div>

</div>


   
  );
};

export default AboutUs;