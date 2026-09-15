import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
let enginePromise = null;

const ParticleSwarm = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }

    enginePromise.then(() => {
      setInit(true);
    }).catch((err) => {
      console.error("Failed to init tsparticles", err);
    });
  }, []);

  const options = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 50,
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.5,
          },
        },
      },
    },
    particles: {
      color: {
        value: ["#ffffff", "#c4b5fd", "#93c5fd"],
      },
      links: {
        color: "#d8b4fe",
        distance: 165,
        enable: true,
        opacity: 0.48,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1.35,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 76,
      },
      opacity: {
        value: { min: 0.35, max: 0.8 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  if (init) {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Particles
          id="tsparticles"
          options={options}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  return <></>;
};

export default ParticleSwarm;
