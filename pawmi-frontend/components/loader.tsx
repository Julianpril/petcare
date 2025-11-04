import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";

/**
 * HamsterLoader (React Native)
 * - Sin dependencias externas
 * - Reproduce: rueda girando, hámster corriendo, parpadeo, oreja/cabeza/cola/osamenta
 * - Tamaño base: 168px (12em * 14px). Puedes escalar con "size".
 */
export default function Loader({ size = 168, duration = 1000 }: { size?: number; duration?: number }) {
  // control maestro 0..1 en bucle (equivale a var(--dur))
  const t = useRef(new Animated.Value(0)).current;
  // rotación de la rueda (independiente para giro continuo lineal)
  const wheel = useRef(new Animated.Value(0)).current;
  // parpadeo (escala Y del ojo)
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ciclo maestro (ease-in-out)
    Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // rueda rota linealmente
    Animated.loop(
      Animated.timing(wheel, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // parpadeo rápido hacia el 95% del ciclo
    const runBlink = () => {
      blink.setValue(1);
      Animated.sequence([
        Animated.delay(Math.max(0, duration * 0.90)), // desde 90%…
        Animated.timing(blink, { toValue: 0.05, duration: duration * 0.05, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: duration * 0.05, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) runBlink(); });
    };
    runBlink();

    // anunciar como imagen decorativa accesible
    AccessibilityInfo.announceForAccessibility?.("Cargando");
  }, [t, wheel, blink, duration]);

  // Helpers de interpolación (emulan los keyframes de CSS)
  const interp = (input: number[], output: number[]) =>
    t.interpolate({ inputRange: input, outputRange: output });

  // Transformaciones clave
  const hamsterRotate = interp([0, 0.5, 1], [4, 0, 4]); // @keyframes hamster
  const headRotate   = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [0,   8,     0,   8,     0,   8,     0,    8,    0]
  );
  const earRotate    = headRotate.interpolate({
    inputRange: [0, 8],
    outputRange: [0, 12],
    extrapolate: "clamp",
  });

  const bodyRotate   = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [0,  -2,     0,   -2,     0,   -2,     0,   -2,    0]
  );

  const frLimb = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [50, -30, 50, -30, 50, -30, 50, -30, 50]
  );
  const flLimb = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [-30, 50, -30, 50, -30, 50, -30, 50, -30]
  );
  const brLimb = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [-60, 20, -60, 20, -60, 20, -60, 20, -60]
  );
  const blLimb = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [20, -60, 20, -60, 20, -60, 20, -60, 20]
  );
  const tailRotate = interp(
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [30, 10, 30, 10, 30, 10, 30, 10, 30]
  );

  const wheelSpin = wheel.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });

  // Escala base (em → px)
  const em = size / 12; // el original era 12em de ancho/alto

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Hámster naranja y beige corriendo en una rueda metálica"
      style={[styles.wrap, { width: size, height: size }]}
    >
      {/* Rueda */}
      <Animated.View
        style={[
          styles.wheel,
          {
            borderRadius: size / 2,
            width: size,
            height: size,
            transform: [{ rotate: wheelSpin }],
          },
        ]}
      >
        {/* “Spoke”: barra cruzada */}
        <View style={[styles.spoke, { width: size * 0.98, height: 2, top: size / 2 - 1, left: size * 0.01 }]} />
        <View style={[styles.spokeV, { height: size * 0.98, width: 2, left: size / 2 - 1, top: size * 0.01 }]} />
      </Animated.View>

      {/* Hámster */}
      <Animated.View
        style={[
          styles.hamster,
          {
            width: 7 * em,
            height: 3.75 * em,
            left: size / 2 - 3.5 * em,
            top: size / 2,
            transform: [
              { translateX: -0.8 * em },
              { translateY: 1.85 * em },
              { rotate: hamsterRotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) },
            ],
          },
        ]}
      >
        {/* Cuerpo */}
        <Animated.View
          style={[
            styles.body,
            {
              width: 4.5 * em,
              height: 3 * em,
              left: 2 * em,
              top: 0.25 * em,
              transform: [{ rotate: bodyRotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}
        >
          {/* Cabeza */}
          <Animated.View
            style={[
              styles.head,
              {
                width: 2.75 * em,
                height: 2.5 * em,
                left: -2 * em,
                transform: [{ rotate: headRotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
              },
            ]}
          >
            <View style={[styles.ear, { right: -0.25 * em, top: -0.25 * em, width: 0.75 * em, height: 0.75 * em,
              transform: [{ rotate: earRotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            }]} />
            <Animated.View style={[styles.eye, { left: 1.25 * em, top: 0.375 * em, width: 0.5 * em, height: 0.5 * em, transform: [{ scaleY: blink }] }]} />
            <View style={[styles.nose, { left: 0, top: 0.75 * em, width: 0.2 * em, height: 0.25 * em }]} />
          </Animated.View>

          {/* Patas delanteras */}
          <Animated.View style={[
            styles.limbFrontR,
            {
              left: 0.5 * em, top: 2 * em, width: 1 * em, height: 1.5 * em,
              transform: [{ rotate: frLimb.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}/>
          <Animated.View style={[
            styles.limbFrontL,
            {
              left: 0.5 * em, top: 2 * em, width: 1 * em, height: 1.5 * em,
              transform: [{ rotate: flLimb.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}/>

          {/* Patas traseras */}
          <Animated.View style={[
            styles.limbBackR,
            {
              left: 2.8 * em, top: 1 * em, width: 1.5 * em, height: 2.5 * em,
              transform: [{ rotate: brLimb.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}/>
          <Animated.View style={[
            styles.limbBackL,
            {
              left: 2.8 * em, top: 1 * em, width: 1.5 * em, height: 2.5 * em,
              transform: [{ rotate: blLimb.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}/>

          {/* Cola */}
          <Animated.View style={[
            styles.tail,
            {
              right: -0.5 * em, top: 1.5 * em, width: 1 * em, height: 0.5 * em,
              transform: [{ rotate: tailRotate.interpolate({ inputRange: [-180, 180], outputRange: ["-180deg", "180deg"] }) }],
            },
          ]}/>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  // RUEDA
  wheel: {
    position: "absolute",
    top: 0, left: 0,
    borderWidth: 6,
    borderColor: "#9a9a9a",
    backgroundColor: "transparent",
  },
  spoke: {
    position: "absolute",
    backgroundColor: "#a8a8a8",
    opacity: 0.9,
  },
  spokeV: {
    position: "absolute",
    backgroundColor: "#b3b3b3",
    opacity: 0.9,
  },

  // HÁMSTER
  hamster: {
    position: "absolute",
    transformOrigin: "center",
  },

  body: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,90%)",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 300,
    borderBottomRightRadius: 999,
    borderBottomLeftRadius: 300,
    // sombras internas (simuladas con bordes/overlay sería más costoso; dejamos color base)
  },

  head: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,55%)",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 300,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 999,
    justifyContent: "center",
  },

  ear: {
    position: "absolute",
    backgroundColor: "hsl(0,90%,85%)",
    borderRadius: 999,
  },

  eye: {
    position: "absolute",
    backgroundColor: "#000",
    borderRadius: 999,
  },

  nose: {
    position: "absolute",
    backgroundColor: "hsl(0,90%,75%)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 65,
    borderBottomRightRadius: 85,
    borderBottomLeftRadius: 15,
  },

  // Patas: usamos solo formas simples + borderRadius para imitar la silueta
  limbFrontR: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,80%)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  limbFrontL: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,90%)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  limbBackR: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,80%)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  limbBackL: {
    position: "absolute",
    backgroundColor: "hsl(30,90%,90%)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  tail: {
    position: "absolute",
    backgroundColor: "hsl(0,90%,85%)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
    borderBottomLeftRadius: 6,
  },
});
