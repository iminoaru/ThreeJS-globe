'use client'

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// City data
const cities = [
    {
        name: 'Los Angeles',
        lat: 34.0522,
        lon: -118.2437,
        overview: 'Los Angeles, the entertainment capital of the world, hosted an exciting gaming tournament that attracted players from across the globe.',
        events: [
            {
                name: 'LA Gaming Expo 2024',
                description: 'We attended the LA Gaming Expo, where we got to play the latest AAA titles and indie gems. The highlight was the VR showcase featuring next-gen hardware.',
                date: 'June 15-17, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
            {
                name: 'Esports World Cup',
                description: 'We witnessed the intense finals of the Esports World Cup, where top teams competed in League of Legends and Valorant. The atmosphere was electric!',
                date: 'July 20-22, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
        ],
        attractions: ['Universal Studios', 'Hollywood Walk of Fame', 'Griffith Observatory'],
        cuisine: ['In-N-Out Burger', 'Korean BBQ', 'Gourmet Food Trucks'],
        transport: 'Metro system, ride-sharing services, rental cars',
    },
    {
        name: 'Seattle',
        lat: 47.6062,
        lon: -122.3321,
        overview: 'Seattle, home to many game development studios, hosted a series of gaming events that showcased both mainstream and indie titles.',
        events: [
            {
                name: 'PAX West',
                description: 'At PAX West, we explored a vast array of indie games and attended panels with famous game developers. The cosplay competition was a visual treat!',
                date: 'September 1-4, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
            {
                name: 'Seattle Indies Expo',
                description: 'We discovered many innovative games at the Seattle Indies Expo. It was inspiring to see the creativity of small development teams.',
                date: 'August 25, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
        ],
        attractions: ['Space Needle', 'Pike Place Market', 'Museum of Pop Culture'],
        cuisine: ['Seattle-style hot dogs', 'Fresh seafood', 'Craft beer'],
        transport: 'Light rail, buses, monorail',
    },
    {
        name: 'Tokyo',
        lat: 35.6762,
        lon: 139.6503,
        overview: 'Tokyo, a hub of gaming culture, offered an unforgettable experience with its blend of traditional arcades and cutting-edge gaming technology.',
        events: [
            {
                name: 'Tokyo Game Show',
                description: 'The Tokyo Game Show was a sensory overload of upcoming Japanese and international games. We got hands-on time with highly anticipated titles and saw impressive tech demos.',
                date: 'September 20-23, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
            {
                name: 'Akihabara Gaming Tour',
                description: 'We explored the gaming mecca of Akihabara, visiting classic arcades, maid cafes, and electronics shops. The retro gaming section was a nostalgic trip!',
                date: 'September 24, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
        ],
        attractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing'],
        cuisine: ['Sushi', 'Ramen', 'Takoyaki'],
        transport: 'Efficient metro system, JR trains',
    },
    {
        name: 'Berlin',
        lat: 52.5200,
        lon: 13.4050,
        overview: 'Berlin, known for its thriving tech scene, hosted several gaming events that showcased European game development talent.',
        events: [
            {
                name: 'Gamescom',
                description: 'Although not in Berlin itself, we took a short trip to Cologne for Gamescom, Europe\'s largest gaming event. The scale of the exhibitionSA was impressive, with major announcements from top publishers.',
                date: 'August 21-25, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],
            },
            {
                name: 'Berlin Games Festival',
                description: 'The Berlin Games Festival focused on indie and art games. We participated in game jams and attended talks about the intersection of games and art.',
                date: 'July 5-7, 2024',
                photos: ['/image1.jpg', '/image2.jpg', '/image3.jpg'],},
        ],
        attractions: ['Brandenburg Gate', 'East Side Gallery', 'Reichstag Building'],
        cuisine: ['Currywurst', 'Döner kebab', 'German beer'],
        transport: 'U-Bahn and S-Bahn train systems, trams, buses',
    },
];


const Globe: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [debug, setDebug] = useState<string>('Initializing...');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<number>(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
    const globeRef = useRef<THREE.Mesh>();
    const markersRef = useRef<THREE.Mesh[]>([]);
    const sceneRef = useRef<THREE.Scene>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();

    useEffect(() => {
        if (!mountRef.current) return;

        setDebug('Setting up scene...');
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        setDebug('Creating globe...');
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/earth_texture.jpg', () => {
            setDebug('Earth texture loaded successfully.');
        }, undefined, (err: any) => {
            setDebug(`Error loading Earth texture: ${err.message}`);
        });
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: textureLoader.load('/earth_bumpmap.jpg'),
            bumpScale: 0.05,
            specularMap: textureLoader.load('/earth_specular.jpg'),
            specular: new THREE.Color('grey')
        });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        globeRef.current = globe;

        setDebug('Setting up camera and controls...');
        camera.position.z = 15;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        setDebug('Adding city markers...');
        cities.forEach(city => {
            const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);

            const phi = (90 - city.lat) * (Math.PI / 180);
            const theta = (city.lon + 180) * (Math.PI / 180);

            marker.position.x = -5 * Math.sin(phi) * Math.cos(theta);
            marker.position.y = 5 * Math.cos(phi);
            marker.position.z = 5 * Math.sin(phi) * Math.sin(theta);

            globe.add(marker);
            marker.userData = { cityName: city.name };
            markersRef.current.push(marker);
        });

        setDebug('Setting up lighting...');
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        setDebug('Setting up interactivity...');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(markersRef.current);

            if (intersects.length > 0) {
                const cityName = intersects[0].object.userData.cityName;
                setSelectedCity(cityName);
                setSelectedEvent(0);
                setCurrentPhotoIndex(0);
            }
        };

        window.addEventListener('click', onClick);

        setDebug('Starting animation loop...');
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        setDebug('Globe setup complete.');

        return () => {
            setDebug('Cleaning up...');
            window.removeEventListener('click', onClick);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    const handleCloseInfo = () => {
        setSelectedCity(null);
    };

    const handleNextEvent = () => {
        const city = cities.find(c => c.name === selectedCity);
        if (city && selectedEvent < city.events.length - 1) {
            setSelectedEvent(prev => prev + 1);
            setCurrentPhotoIndex(0);
        }
    };

    const handlePrevEvent = () => {
        if (selectedEvent > 0) {
            setSelectedEvent(prev => prev - 1);
            setCurrentPhotoIndex(0);
        }
    };

    const handleNextPhoto = () => {
        const city = cities.find(c => c.name === selectedCity);
        if (city && currentPhotoIndex < city.events[selectedEvent].photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    };

    const handlePrevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px'
            }}>
                Debug: {debug}
            </div>
            {selectedCity && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.9)',
                    color: 'white',
                    padding: '20px',
                    overflowY: 'auto',
                    boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
                }}>
                    <button onClick={handleCloseInfo} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                    <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>{selectedCity}</h1>
                    <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>{cities.find(c => c.name === selectedCity)?.overview}</p>

                    <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Events</h2>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={cities.find(c => c.name === selectedCity)?.events[selectedEvent].photos[currentPhotoIndex]}
                            alt="Event"
                            style={{ width: '100%', height: '300px', objectFit: 'cover', marginBottom: '10px' }}
                        />
                        <button onClick={handlePrevPhoto} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={handleNextPhoto} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <h3 style={{ fontSize: '1.2em', marginBottom: '10px' }}>{cities.find(c => c.name === selectedCity)?.events[selectedEvent].name}</h3>
                    <p style={{ marginBottom: '10px' }}>{cities.find(c => c.name === selectedCity)?.events[selectedEvent].description}</p>
                    <p style={{ marginBottom: '20px' }}>Date: {cities.find(c => c.name === selectedCity)?.events[selectedEvent].date}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <button onClick={handlePrevEvent} disabled={selectedEvent === 0} style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', opacity: selectedEvent === 0 ? 0.5 : 1 }}>Previous Event</button>
                        <button onClick={handleNextEvent} disabled={selectedEvent === (cities.find(c => c.name === selectedCity)?.events.length ?? 0) - 1} style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', opacity: selectedEvent === (cities.find(c => c.name === selectedCity)?.events.length ?? 0) - 1 ? 0.5 : 1 }}>Next Event</button>
                    </div>

                    <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Attractions</h2>
                    <ul style={{ marginBottom: '20px' }}>
                        {cities.find(c => c.name === selectedCity)?.attractions.map((attraction, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>{attraction}</li>
                        ))}
                    </ul>

                    <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Local Cuisine</h2>
                    <ul style={{ marginBottom: '20px' }}>
                        {cities.find(c => c.name === selectedCity)?.cuisine.map((dish, index) => (
                            <li key={index} style={{ marginBottom: '5px' }}>{dish}</li>
                        ))}
                    </ul>

                    <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>Transportation</h2>
                    <p>{cities.find(c => c.name === selectedCity)?.transport}</p>
                </div>
            )}
        </div>
    );
};

export default Globe;