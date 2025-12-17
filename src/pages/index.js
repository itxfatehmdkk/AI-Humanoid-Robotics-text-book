import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// Import Framer Motion for advanced animations
import { motion } from 'framer-motion';

// Define animation variants for the components
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100
    }
  }
};

const titleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 300
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300
    }
  },
  tap: {
    scale: 0.95
  }
};

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <motion.header className={clsx('hero hero--primary', styles.heroBanner)}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        background: [
          'linear-gradient(135deg, #1a2a6c 0%, #2a5298 25%, #3a7bd5 50%, #00d2ff 100%)',
          'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 25%, #2a5298 50%, #1a2a6c 100%)',
          'linear-gradient(135deg, #1a2a6c 0%, #2a5298 25%, #3a7bd5 50%, #00d2ff 100%)'
        ]
      }}
      transition={{
        duration: 8,  // Reduced from 20 to 8 seconds
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }}
    >
      <div className="container">
        <motion.div
          className={styles.heroContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{  // Add transition to reduce initial load time
            staggerChildren: 0.1,  // Faster stagger
            delayChildren: 0.1     // Faster delay
          }}
        >
          <motion.h1
            className={clsx('hero__title', styles.heroTitle)}
            variants={titleVariants}
            whileHover="hover"
            transition={{  // Add transition to title
              type: 'spring',
              damping: 15,
              stiffness: 100,
              duration: 0.3  // Fast transition
            }}
          >
            <span className={styles.titleWord}>The</span>{' '}
            <span className={styles.titleWord}>Humanoid</span>{' '}
            <span className={styles.titleWord}>Robotics</span>{' '}
            <span className={styles.titleWord}>Course</span>{' '}
            <span className={styles.titleWord}>Curriculum</span>
          </motion.h1>
          <motion.p
            className={clsx('hero__subtitle', styles.heroSubtitle)}
            variants={itemVariants}
            transition={{ duration: 0.3 }}  // Fast transition
          >
            AI Assistant with 🤖 🧠 💬
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}  // Fast transition
          >
            <Link
              className="button button--secondary button--lg"
              to="/module-1-robotic-nervous-system/ros2-fundamentals"
            >
              Start Reading 📖
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  // Add homepage class to body for specific styling
  useEffect(() => {
    document.body.classList.add('homepage');

    // Clean up the class when component unmounts
    return () => {
      document.body.classList.remove('homepage');
    };
  }, []);

  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="AI Assistant with Robotics Education"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}  // Very fast initial page load
      >
        <HomepageHeader />
        <main>
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                <motion.div
                  className="col col--4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.3 }}  // Faster transitions
                >
                  <div className="text--center padding-horiz--md">
                    <h3>📘 Complete Robotics Curriculum</h3>
                    <p>Master ROS 2, Digital Twins, NVIDIA Isaac, and Vision-Language-Action robotics from fundamentals to advanced concepts</p>
                  </div>
                </motion.div>
                <motion.div
                  className="col col--4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.3 }}  // Faster transitions
                >
                  <div className="text--center padding-horiz--md">
                    <h3>🤖 Intelligent Learning Assistant</h3>
                    <p>Instant, contextual answers powered by advanced AI that understands the entire course content</p>
                  </div>
                </motion.div>
                <motion.div
                  className="col col--4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.3 }}  // Faster transitions
                >
                  <div className="text--center padding-horiz--md">
                    <h3>🎯 Adaptive Learning Path</h3>
                    <p>Personalized content that evolves with your expertise and interests</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>
      </motion.div>
    </Layout>
  );
}