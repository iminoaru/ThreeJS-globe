/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push({
            'three/examples/jsm/controls/OrbitControls': 'THREE',
        })
        return config
    },

};

export default nextConfig;






